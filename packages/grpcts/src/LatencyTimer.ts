export interface ILatencyTimer {
  start: () => ILatency;
}

export interface ILatency {
  getValue: () => number;
}

export class LatencyTimer {
  public start(): Latency {
    const now = new Date();
    return new Latency(now);
  }
}

class Latency {
  constructor(readonly startDate: Date) {}

  public getValue(): number {
    const now = new Date();
    return now.getTime() - this.startDate.getTime();
  }
}
