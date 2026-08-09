/** Identifies whether this stop represents a stop or station. */
export type LocationType =
  | 'ENTRANCE'
  /** A physical structure or area that contains one or more stop. */
  | 'STATION'
  /** A location where passengers board or disembark from a transit vehicle. */
  | 'STOP';

export type Mode =
  /** AIRPLANE */
  | 'AIRPLANE'
  /** BICYCLE */
  | 'BICYCLE'
  /** BUS */
  | 'BUS'
  /** CABLE_CAR */
  | 'CABLE_CAR'
  /** CAR */
  | 'CAR'
  /** Private car trips shared with others. */
  | 'CARPOOL'
  /** COACH */
  | 'COACH'
  /** FERRY */
  | 'FERRY'
  /** Enables flexible transit for access and egress legs */
  | 'FLEX'
  /** Enables flexible transit for access and egress legs */
  | 'FLEXIBLE'
  /** FUNICULAR */
  | 'FUNICULAR'
  /** GONDOLA */
  | 'GONDOLA'
  /** Only used internally. No use for API users. */
  | 'LEG_SWITCH'
  /** Railway in which the track consists of a single rail or a beam. */
  | 'MONORAIL'
  /** RAIL */
  | 'RAIL'
  /** SCOOTER */
  | 'SCOOTER'
  /** SUBWAY */
  | 'SUBWAY'
  /** A taxi, possibly operated by a public transport agency. */
  | 'TAXI'
  /** TRAM */
  | 'TRAM'
  /** A special transport mode, which includes all public transport. */
  | 'TRANSIT'
  /** Electric buses that draw power from overhead wires using poles. */
  | 'TROLLEYBUS'
  /** WALK */
  | 'WALK';
