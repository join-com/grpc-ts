import * as Protobuf from '@join-com/protobufjs-wrappers';
import * as fs from 'fs';
import * as grpc from 'grpc';
import * as _ from 'lodash';
import * as path from 'path';

export type Serialize<T> = (value: T) => Buffer;

export type Deserialize<T> = (bytes: Buffer) => T;

export interface MethodDefinition<RequestType, ResponseType> {
  path: string;
  requestStream: boolean;
  responseStream: boolean;
  requestSerialize: Serialize<RequestType>;
  responseSerialize: Serialize<ResponseType>;
  requestDeserialize: Deserialize<RequestType>;
  responseDeserialize: Deserialize<ResponseType>;
  originalName?: string;
}

export interface ServiceDefinition {
  [index: string]: MethodDefinition<object, object>;
}

export interface PackageDefinition {
  [index: string]: ServiceDefinition;
}

export type Options = Protobuf.IParseOptions &
  Protobuf.IConversionOptions & {
    includeDirs?: string[];
  };

function joinName(baseName: string, name: string): string {
  if (baseName === '') {
    return name;
  } else {
    return baseName + '.' + name;
  }
}

function getAllServices(
  obj: Protobuf.NamespaceBase,
  parentName: string,
): Array<[string, Protobuf.Service]> {
  const objName = joinName(parentName, obj.name);
  if (obj.hasOwnProperty('methods')) {
    return [[objName, obj as Protobuf.Service]];
  } else {
    return obj.nestedArray
      .map(child => {
        if (child.hasOwnProperty('nested')) {
          return getAllServices(child as Protobuf.NamespaceBase, objName);
        } else {
          return [];
        }
      })
      .reduce(
        (accumulator, currentValue) => accumulator.concat(currentValue),
        [],
      );
  }
}

function createDeserializer(
  cls: Protobuf.Type,
  options: Options,
): Deserialize<object> {
  return function deserialize(argBuf: Buffer): object {
    return cls.toObject(cls.decode(argBuf), options);
  };
}

function createSerializer(cls: Protobuf.Type): Serialize<object> {
  return function serialize(arg: object): Buffer {
    const message = cls.fromObject(arg);
    return cls.encode(message).finish() as Buffer;
  };
}

function createMethodDefinition(
  method: Protobuf.Method,
  serviceName: string,
  options: Options,
): MethodDefinition<object, object> {
  return {
    path: '/' + serviceName + '/' + method.name,
    requestStream: !!method.requestStream,
    responseStream: !!method.responseStream,
    requestSerialize: createSerializer(
      method.resolvedRequestType as Protobuf.Type,
    ),
    requestDeserialize: createDeserializer(
      method.resolvedRequestType as Protobuf.Type,
      options,
    ),
    responseSerialize: createSerializer(
      method.resolvedResponseType as Protobuf.Type,
    ),
    responseDeserialize: createDeserializer(
      method.resolvedResponseType as Protobuf.Type,
      options,
    ),
    // TODO(murgatroid99): Find a better way to handle this
    originalName: _.camelCase(method.name),
  };
}

function createServiceDefinition(
  service: Protobuf.Service,
  name: string,
  options: Options,
): ServiceDefinition {
  const def: ServiceDefinition = {};
  for (const method of service.methodsArray) {
    def[method.name] = createMethodDefinition(method, name, options);
  }
  return def;
}

function createPackageDefinition(
  root: Protobuf.Root,
  options: Options,
): PackageDefinition {
  const def: PackageDefinition = {};
  for (const [name, service] of getAllServices(root, '')) {
    def[name] = createServiceDefinition(service, name, options);
  }
  return def;
}

function addIncludePathResolver(root: Protobuf.Root, includePaths: string[]) {
  root.resolvePath = (__: string, target: string) => {
    for (const directory of includePaths) {
      const fullPath: string = path.join(directory, target);
      try {
        fs.accessSync(fullPath, fs.constants.R_OK);
        return fullPath;
      } catch (err) {
        continue;
      }
    }
    return null;
  };
}

/**
 * Load a .proto file with the specified options.
 * @param filename The file path to load. Can be an absolute path or relative to
 *     an include path.
 * @param options.keepCase Preserve field names. The default is to change them
 *     to camel case.
 * @param options.longs The type that should be used to represent `long` values.
 *     Valid options are `Number` and `String`. Defaults to a `Long` object type
 *     from a library.
 * @param options.enums The type that should be used to represent `enum` values.
 *     The only valid option is `String`. Defaults to the numeric value.
 * @param options.bytes The type that should be used to represent `bytes`
 *     values. Valid options are `Array` and `String`. The default is to use
 *     `Buffer`.
 * @param options.defaults Set default values on output objects. Defaults to
 *     `false`.
 * @param options.arrays Set empty arrays for missing array values even if
 *     `defaults` is `false`. Defaults to `false`.
 * @param options.objects Set empty objects for missing object values even if
 *     `defaults` is `false`. Defaults to `false`.
 * @param options.oneofs Set virtual oneof properties to the present field's
 *     name
 * @param options.includeDirs Paths to search for imported `.proto` files.
 */
export function load(
  filename: string,
  options: Options,
): Promise<PackageDefinition> {
  const root: Protobuf.Root = new Protobuf.Root();
  if (!!options.includeDirs) {
    if (!(options.includeDirs instanceof Array)) {
      return Promise.reject(
        new Error('The includeDirs option must be an array'),
      );
    }
    addIncludePathResolver(root, options.includeDirs as string[]);
  }
  return root.load(filename, options).then(loadedRoot => {
    loadedRoot.resolveAll();
    return createPackageDefinition(root, options);
  });
}

export function loadSync(
  filename: string,
  options: Options,
): PackageDefinition {
  const root: Protobuf.Root = new Protobuf.Root();
  if (!!options.includeDirs) {
    if (!(options.includeDirs instanceof Array)) {
      throw new Error('The include option must be an array');
    }
    addIncludePathResolver(root, options.includeDirs as string[]);
  }
  const loadedRoot = root.loadSync(filename, options);
  loadedRoot.resolveAll();
  return createPackageDefinition(root, options);
}

export const loadService = (protoPath: string) => {
  const packageDefinition = loadSync(protoPath, {
    longs: Number,
    enums: String,
    bytes: String,
  });
  return grpc.loadPackageDefinition(packageDefinition);
};

export default loadService;
