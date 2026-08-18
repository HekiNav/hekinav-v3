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

export type PickupDropoffType =
  /** Must phone agency to arrange pickup / drop off. */
  | 'CALL_AGENCY'
  /** Must coordinate with driver to arrange pickup / drop off. */
  | 'COORDINATE_WITH_DRIVER'
  /** No pickup / drop off available. */
  | 'NONE'
  /** Regularly scheduled pickup / drop off. */
  | 'SCHEDULED';

/** A coordinate used for a location in a plan query. */
export type PlanCoordinateInput = {
  /** Latitude as a WGS84 format number. */
  latitude: unknown;
  /** Longitude as a WGS84 format number. */
  longitude: unknown;
};

/**
 * Plan location settings. Location must be set. Label is optional
 * and used for naming the location.
 */
export type PlanLabeledLocationInput = {
  /**
   * A label that can be attached to the location. This label is then returned with the location
   * in the itineraries.
   */
  label?: string | null | undefined;
  /** A location that has to be used in an itinerary. */
  location: PlanLocationInput;
};

/** Plan location. Either a coordinate or a stop location should be defined. */
export type PlanLocationInput = {
  /** Coordinate of the location. Note, either a coordinate or a stop location should be defined. */
  coordinate?: PlanCoordinateInput | null | undefined;
  /**
   * Stop, station, a group of stop places or multimodal stop place that should be used as
   * a location for the search. The trip doesn't have to use the given stop location for a
   * transit connection as it's possible to start walking to another stop from the given
   * location. If a station or a group of stop places is provided, a stop that makes the most
   * sense for the journey is picked as the location within the station or group of stop places.
   */
  stopLocation?: PlanStopLocationInput | null | undefined;
};

/**
 * Stop, station, a group of stop places or multimodal stop place that should be used as
 * a location for the search. The trip doesn't have to use the given stop location for a
 * transit connection as it's possible to start walking to another stop from the given
 * location. If a station or a group of stop places is provided, a stop that makes the most
 * sense for the journey is picked as the location within the station or group of stop places.
 */
export type PlanStopLocationInput = {
  /**
   * ID of the stop, station, a group of stop places or multimodal stop place. Format
   * should be `FeedId:StopLocationId`.
   */
  stopLocationId: string;
};

export type RealtimeState =
  /** The trip has been added using a real-time update, i.e. the trip was not present in the GTFS feed. */
  | 'ADDED'
  /** The trip has been canceled by a real-time update. */
  | 'CANCELED'
  /**
   * The trip information has been updated and resulted in a different trip pattern
   * compared to the trip pattern of the scheduled trip.
   */
  | 'MODIFIED'
  /** The trip information comes from the GTFS feed, i.e. no real-time update has been applied. */
  | 'SCHEDULED'
  /** The trip information has been updated, but the trip pattern stayed the same as the trip pattern of the scheduled trip. */
  | 'UPDATED';

/**
 * Transit modes include modes that are used within organized transportation networks
 * run by public transportation authorities, taxi companies etc.
 * Equivalent to GTFS route_type or to NeTEx TransportMode.
 */
export type TransitMode =
  | 'AIRPLANE'
  | 'BUS'
  | 'CABLE_CAR'
  /** Private car trips shared with others. */
  | 'CARPOOL'
  | 'COACH'
  | 'FERRY'
  | 'FUNICULAR'
  | 'GONDOLA'
  /** Railway in which the track consists of a single rail or a beam. */
  | 'MONORAIL'
  /** This includes long or short distance trains. */
  | 'RAIL'
  /** Used for off-road snow and ice vehicles */
  | 'SNOW_AND_ICE'
  /** Subway or metro, depending on the local terminology. */
  | 'SUBWAY'
  /** A taxi, possibly operated by a public transport agency. */
  | 'TAXI'
  | 'TRAM'
  /** Electric buses that draw power from overhead wires using poles. */
  | 'TROLLEYBUS';

/** Categorization for via locations. */
export type ViaLocationType =
  /**
   * The via stop location must be visited as part of a transit trip as at the boarding stop, the
   * intermediate stop, or the alighting stop.
   */
  | 'PASS_THROUGH'
  /**
   * The location is visited physically by boarding or alighting a transit trip at a given stop, or by
   * traveling via requested coordinate location as part of a access, transfer, egress or direct
   * segment. Intermediate stops visited on-board do not count.
   */
  | 'VISIT';
