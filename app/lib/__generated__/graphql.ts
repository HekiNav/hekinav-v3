/**
 * Plan accessibilty preferences. This can be expanded to contain preferences for various accessibility use cases
 * in the future. Currently only generic wheelchair preferences are available.
 */
export type AccessibilityPreferencesInput = {
  /** Wheelchair related preferences. Note, currently this is the only accessibility mode that is available. */
  wheelchair?: WheelchairPreferencesInput | null | undefined;
};

/** Preferences related to alighting from a transit vehicle. */
export type AlightPreferencesInput = {
  /** What is the required minimum time alighting from a vehicle. */
  slack?: unknown;
};

/** Preferences for bicycle parking facilities used during the routing. */
export type BicycleParkingPreferencesInput = {
  /**
   * Selection filters to include or exclude parking facilities.
   * An empty list will include all facilities in the routing search.
   */
  filters?: Array<ParkingFilter> | null | undefined;
  /**
   * If non-empty every parking facility that doesn't match this set of conditions will
   * receive an extra cost (defined by `unpreferredCost`) and therefore avoided.
   */
  preferred?: Array<ParkingFilter> | null | undefined;
  /**
   * If `preferred` is non-empty, using a parking facility that doesn't contain
   * at least one of the preferred conditions, will receive this extra cost and therefore avoided if
   * preferred options are available.
   */
  unpreferredCost?: unknown;
};

/** Preferences related to travel with a bicycle. */
export type BicyclePreferencesInput = {
  /** Cost of boarding a vehicle with a bicycle. */
  boardCost?: unknown;
  /** What criteria should be used when optimizing a cycling route. */
  optimization?: CyclingOptimizationInput | null | undefined;
  /** Bicycle parking related preferences. */
  parking?: BicycleParkingPreferencesInput | null | undefined;
  /** A multiplier for how bad cycling is compared to being in transit for equal lengths of time. */
  reluctance?: unknown;
  /** Bicycle rental related preferences. */
  rental?: BicycleRentalPreferencesInput | null | undefined;
  /**
   * Maximum speed on flat ground while riding a bicycle. Note, this speed is higher than
   * the average speed will be in itineraries as this is the maximum speed but there are
   * factors that slow down cycling such as crossings, intersections and elevation changes.
   */
  speed?: unknown;
  /** Walking preferences when walking a bicycle. */
  walk?: BicycleWalkPreferencesInput | null | undefined;
};

/** Preferences related to bicycle rental (station based or floating bicycle rental). */
export type BicycleRentalPreferencesInput = {
  /**
   * Rental networks which can be potentially used as part of an itinerary. If this field has no default value,
   * it means that all networks are allowed unless some are banned with `bannedNetworks`.
   */
  allowedNetworks?: Array<string> | null | undefined;
  /** Rental networks which cannot be used as part of an itinerary. */
  bannedNetworks?: Array<string> | null | undefined;
  /**
   * Is it possible to arrive to the destination with a rented bicycle and does it
   * come with an extra cost.
   */
  destinationBicyclePolicy?: DestinationBicyclePolicyInput | null | undefined;
};

/** Costs related to walking a bicycle. */
export type BicycleWalkPreferencesCostInput = {
  /**
   * A static cost that is added each time hopping on or off a bicycle to start or end
   * bicycle walking. However, this cost is not applied when getting on a rented bicycle
   * for the first time or when getting off the bicycle when returning the bicycle.
   */
  mountDismountCost?: unknown;
  /**
   * A cost multiplier of bicycle walking travel time. The multiplier is for how bad
   * walking the bicycle is compared to being in transit for equal lengths of time.
   */
  reluctance?: unknown;
};

/** Preferences for walking a bicycle. */
export type BicycleWalkPreferencesInput = {
  /** Costs related to walking a bicycle. */
  cost?: BicycleWalkPreferencesCostInput | null | undefined;
  /**
   * How long it takes to hop on or off a bicycle when switching to walking the bicycle
   * or when getting on the bicycle again. However, this is not applied when getting
   * on a rented bicycle for the first time or off the bicycle when returning the bicycle.
   */
  mountDismountTime?: unknown;
  /**
   * Maximum walk speed on flat ground. Note, this speed is higher than the average speed
   * will be in itineraries as this is the maximum speed but there are
   * factors that slow down walking such as crossings, intersections and elevation changes.
   */
  speed?: unknown;
};

/**
 * Preferences related to boarding a transit vehicle. Note, board costs for each street mode
 * can be found under the street mode preferences.
 */
export type BoardPreferencesInput = {
  /**
   * What is the required minimum waiting time at a stop. Setting this value as `PT0S`, for example, can lead
   * to passenger missing a connection when the vehicle leaves ahead of time or the passenger arrives to the
   * stop later than expected.
   */
  slack?: unknown;
  /** A multiplier for how bad waiting at a stop is compared to being in transit for equal lengths of time. */
  waitReluctance?: unknown;
};

/** Preferences for car parking facilities used during the routing. */
export type CarParkingPreferencesInput = {
  /**
   * Selection filters to include or exclude parking facilities.
   * An empty list will include all facilities in the routing search.
   */
  filters?: Array<ParkingFilter> | null | undefined;
  /**
   * If non-empty every parking facility that doesn't match this set of conditions will
   * receive an extra cost (defined by `unpreferredCost`) and therefore avoided.
   */
  preferred?: Array<ParkingFilter> | null | undefined;
  /**
   * If `preferred` is non-empty, using a parking facility that doesn't contain
   * at least one of the preferred conditions, will receive this extra cost and therefore avoided if
   * preferred options are available.
   */
  unpreferredCost?: unknown;
};

/** Preferences related to traveling on a car (excluding car travel on transit services such as taxi). */
export type CarPreferencesInput = {
  /** Cost of boarding a vehicle with a car. */
  boardCost?: unknown;
  /** Car parking related preferences. */
  parking?: CarParkingPreferencesInput | null | undefined;
  /** A multiplier for how bad travelling on car is compared to being in transit for equal lengths of time. */
  reluctance?: unknown;
  /** Car rental related preferences. */
  rental?: CarRentalPreferencesInput | null | undefined;
};

/** Preferences related to car rental (station based or floating car rental). */
export type CarRentalPreferencesInput = {
  /**
   * Rental networks which can be potentially used as part of an itinerary. If this field has no default value,
   * it means that all networks are allowed unless some are banned with `bannedNetworks`.
   */
  allowedNetworks?: Array<string> | null | undefined;
  /** Rental networks which cannot be used as part of an itinerary. */
  bannedNetworks?: Array<string> | null | undefined;
  /**
   * The assumed duration of a car rental trip, used to ensure vehicle availability during the
   * rental period.
   *
   * The rental time is calculated relative to the request search time:
   * - Depart-after search: `request time + rental duration`
   * - Arrive-by search: `request time - rental duration`
   *
   * Note: Rental duration only applies to  free-floating vehicles in direct street searches.
   * This is not supported in access/egress in transit searches.
   */
  rentalDuration?: unknown;
};

/** What criteria should be used when optimizing a cycling route. */
export type CyclingOptimizationInput = {
  /** Define optimization by weighing three criteria. */
  triangle?: TriangleCyclingFactorsInput | null | undefined;
  /** Use one of the predefined optimization types. */
  type?: CyclingOptimizationType | null | undefined;
};

/**
 * Predefined optimization alternatives for bicycling routing. For more customization,
 * one can use the triangle factors.
 */
export type CyclingOptimizationType =
  /** Emphasize flatness over safety or duration of the route. This option was previously called `FLAT`. */
  | 'FLAT_STREETS'
  /**
   * Completely ignore the elevation differences and prefer the streets, that are evaluated
   * to be the safest, even more than with the `SAFE_STREETS` option.
   * Safety can also include other concerns such as convenience and general cyclist preferences
   * by taking into account road surface etc. This option was previously called `GREENWAYS`.
   */
  | 'SAFEST_STREETS'
  /**
   * Emphasize cycling safety over flatness or duration of the route. Safety can also include other
   * concerns such as convenience and general cyclist preferences by taking into account
   * road surface etc. This option was previously called `SAFE`.
   */
  | 'SAFE_STREETS'
  /**
   * Search for routes with the shortest duration while ignoring the cycling safety
   * of the streets (the routes should still follow local regulations). Routes can include
   * steep streets, if they are the fastest alternatives. This option was previously called
   * `QUICK`.
   */
  | 'SHORTEST_DURATION';

/**
 * Is it possible to arrive to the destination with a rented bicycle and does it
 * come with an extra cost.
 */
export type DestinationBicyclePolicyInput = {
  /** For networks that require station drop-off, should the routing engine offer results that go directly to the destination without dropping off the rental bicycle first. */
  allowKeeping?: boolean | null | undefined;
  /**
   * Cost associated with arriving to the destination with a rented bicycle.
   * No cost is applied if arriving to the destination after dropping off the rented
   * bicycle.
   */
  keepingCost?: unknown;
};

/**
 * Is it possible to arrive to the destination with a rented scooter and does it
 * come with an extra cost.
 */
export type DestinationScooterPolicyInput = {
  /** For networks that require station drop-off, should the routing engine offer results that go directly to the destination without dropping off the rental scooter first. */
  allowKeeping?: boolean | null | undefined;
  /**
   * Cost associated with arriving to the destination with a rented scooter.
   * No cost is applied if arriving to the destination after dropping off the rented
   * scooter.
   */
  keepingCost?: unknown;
};

export type InputField =
  | 'DATE_TIME'
  | 'FROM'
  | 'TO'
  | 'VIA';

/**
 * A generalized linear cost function that can be applied to a cost value.
 * The coefficient is used to scale the input Cost linearly and the constant is used
 * to add a fixed offset. If we assume a cost c, then f(c) = coefficient * c + constant.
 */
export type LinearCostFunctionInput = {
  /** The coefficient that scales the Cost input linearly. */
  coefficient: number;
  /** The 0th degree constant of the function as a Cost, must be a non-negative integer */
  constant: unknown;
};

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

/**
 * The filter definition to include or exclude parking facilities used during routing.
 *
 * Logically, the filter algorithm work as follows:
 *
 * - The starting point is the set of all facilities, lets call it `A`.
 * - Then all `select` filters are applied to `A`, potentially reducing the number of facilities used.
 *   Let's call the result of this `B`.
 *   An empty `select` will lead to `A` being equal to `B`.
 * - Lastly, the `not` filters are applied to `B`, reducing the set further.
 *   Lets call this final set `C`.
 *   An empty `not` will lead to `B` being equal to `C`.
 * - The remaining parking facilities in `C` are used for routing.
 */
export type ParkingFilter = {
  /**
   * Exclude parking facilities based on their properties.
   *
   * If empty nothing is excluded from the initial set of facilities but may be filtered down
   * further by the `select` filter.
   */
  not?: Array<ParkingFilterOperation> | null | undefined;
  /**
   * Include parking facilities based on their properties.
   *
   * If empty everything is included from the initial set of facilities but may be filtered down
   * further by the `not` filter.
   */
  select?: Array<ParkingFilterOperation> | null | undefined;
};

export type ParkingFilterOperation = {
  /** Filter parking facilities based on their tag */
  tags?: Array<string | null | undefined> | null | undefined;
};

export type PickupDropoffType =
  /** Must phone agency to arrange pickup / drop off. */
  | 'CALL_AGENCY'
  /** Must coordinate with driver to arrange pickup / drop off. */
  | 'COORDINATE_WITH_DRIVER'
  /** No pickup / drop off available. */
  | 'NONE'
  /** Regularly scheduled pickup / drop off. */
  | 'SCHEDULED';

/** Street modes that can be used for access to the transit network from origin. */
export type PlanAccessMode =
  /**
   * Cycling to a stop and boarding a vehicle with the bicycle.
   * Note, this can include walking when it's needed to walk the bicycle.
   * Access can use cycling only if the mode used for transfers
   * and egress is also `BICYCLE`.
   */
  | 'BICYCLE'
  /**
   * Starting the itinerary with a bicycle and parking the bicycle to
   * a parking location. Note, this can include walking after parking
   * the bicycle or when it's needed to walk the bicycle.
   */
  | 'BICYCLE_PARKING'
  /**
   * Bicycle rental can use either station based systems or "floating"
   * vehicles which are not linked to a rental station. Note, if there are no
   * rental options available, access will include only walking. Also, this
   * can include walking before picking up or after dropping off the
   * bicycle or when it's needed to walk the bicycle.
   */
  | 'BICYCLE_RENTAL'
  /**
   * Driving to a stop and boarding a vehicle with the car.
   * Access can use driving only if the mode used for transfers
   * and egress is also `CAR`.
   */
  | 'CAR'
  /**
   * Getting dropped off by a car to a location that is accessible with a car.
   * Note, this can include walking after the drop-off.
   */
  | 'CAR_DROP_OFF'
  /**
   * Starting the itinerary with a car and parking the car to a parking location.
   * Note, this can include walking after parking the car.
   */
  | 'CAR_PARKING'
  /**
   * Car rental can use either station based systems or "floating"
   * vehicles which are not linked to a rental station. Note, if there are no
   * rental options available, access will include only walking. Also, this
   * can include walking before picking up or after dropping off the
   * car.
   */
  | 'CAR_RENTAL'
  /**
   * Flexible transit. This can include different forms of flexible transit that
   * can be defined in GTFS-Flex or in Netex. Note, this can include walking before
   * or after the flexible transit leg.
   */
  | 'FLEX'
  /**
   * Scooter rental can use either station based systems or "floating"
   * vehicles which are not linked to a rental station. Note, if there are no
   * rental options available, access will include only walking. Also, this
   * can include walking before picking up or after dropping off the
   * scooter.
   */
  | 'SCOOTER_RENTAL'
  /** Walking to a stop. */
  | 'WALK';

/** A coordinate used for a location in a plan query. */
export type PlanCoordinateInput = {
  /** Latitude as a WGS84 format number. */
  latitude: unknown;
  /** Longitude as a WGS84 format number. */
  longitude: unknown;
};

/** Plan date time options. Only one of the values should be defined. */
export type PlanDateTimeInput = {
  /**
   * Earliest departure date time. The returned itineraries should not
   * depart before this instant unless one is using paging to find earlier
   * itineraries. Note, it is not currently possible to define both
   * `earliestDeparture` and `latestArrival`.
   */
  earliestDeparture?: unknown;
  /**
   * Latest arrival time date time. The returned itineraries should not
   * arrive to the destination after this instant unless one is using
   * paging to find later itineraries. Note, it is not currently possible
   * to define both `earliestDeparture` and `latestArrival`.
   */
  latestArrival?: unknown;
};

/** Street mode that is used when searching for itineraries that don't use any transit. */
export type PlanDirectMode =
  /**
   * Cycling from the origin to the destination. Note, this can include walking
   * when it's needed to walk the bicycle.
   */
  | 'BICYCLE'
  /**
   * Starting the itinerary with a bicycle and parking the bicycle to
   * a parking location. Note, this can include walking after parking
   * the bicycle or when it's needed to walk the bicycle.
   */
  | 'BICYCLE_PARKING'
  /**
   * Bicycle rental can use either station based systems or "floating"
   * vehicles which are not linked to a rental station. Note, if there are no
   * rental options available, itinerary will include only walking.
   * Also, it can include walking before picking up or after dropping off the
   * bicycle or when it's needed to walk the bicycle.
   */
  | 'BICYCLE_RENTAL'
  /** Driving a car from the origin to the destination. */
  | 'CAR'
  /**
   * Starting the itinerary with a car and parking the car to a parking location.
   * Note, this can include walking after parking the car.
   */
  | 'CAR_PARKING'
  /**
   * Car rental can use either station based systems or "floating"
   * vehicles which are not linked to a rental station. Note, if there are no
   * rental options available, itinerary will include only walking. Also, this
   * can include walking before picking up or after dropping off the
   * car.
   */
  | 'CAR_RENTAL'
  /**
   * Flexible transit. This can include different forms of flexible transit that
   * can be defined in GTFS-Flex or in Netex. Note, this can include walking before
   * or after the flexible transit leg.
   */
  | 'FLEX'
  /**
   * Scooter rental can use either station based systems or "floating"
   * vehicles which are not linked to a rental station. Note, if there are no
   * rental options available, itinerary will include only walking. Also, this
   * can include walking before picking up or after dropping off the
   * scooter.
   */
  | 'SCOOTER_RENTAL'
  /**
   * Walking from the origin to the destination. Note, this can include walking
   * when it's needed to walk the bicycle.
   */
  | 'WALK';

/** Street modes that can be used for egress from the transit network to destination. */
export type PlanEgressMode =
  /**
   * Cycling from a stop to the destination. Note, this can include walking when
   * it's needed to walk the bicycle. Egress can use cycling only if the mode used
   * for access and transfers is also `BICYCLE`.
   */
  | 'BICYCLE'
  /**
   * Bicycle rental can use either station based systems or "floating"
   * vehicles which are not linked to a rental station. Note, if there are no
   * rental options available, egress will include only walking. Also, this
   * can include walking before picking up or after dropping off the
   * bicycle or when it's needed to walk the bicycle.
   */
  | 'BICYCLE_RENTAL'
  /**
   * Driving from a stop to the destination. Egress can use driving only if the mode
   * used for access and transfers is also `CAR`.
   */
  | 'CAR'
  /**
   * Getting picked up by a car from a location that is accessible with a car.
   * Note, this can include walking before the pickup.
   */
  | 'CAR_PICKUP'
  /**
   * Car rental can use either station based systems or "floating"
   * vehicles which are not linked to a rental station. Note, if there are no
   * rental options available, egress will include only walking. Also, this
   * can include walking before picking up or after dropping off the
   * car.
   */
  | 'CAR_RENTAL'
  /**
   * Flexible transit. This can include different forms of flexible transit that
   * can be defined in GTFS-Flex or in Netex. Note, this can include walking before
   * or after the flexible transit leg.
   */
  | 'FLEX'
  /**
   * Scooter rental can use either station based systems or "floating"
   * vehicles which are not linked to a rental station. Note, if there are no
   * rental options available, egress will include only walking. Also, this
   * can include walking before picking up or after dropping off the
   * scooter.
   */
  | 'SCOOTER_RENTAL'
  /** Walking from a stop to the destination. */
  | 'WALK';

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

/** Mode selections for the plan search. */
export type PlanModesInput = {
  /**
   * Street mode that is used when searching for itineraries that don't use any transit.
   * If more than one mode is selected, at least one of them must be used but not necessarily all.
   * There are modes that automatically also use walking such as the rental modes. To force rental
   * to be used, this should only include the rental mode and not `WALK` in addition.
   */
  direct?: Array<PlanDirectMode> | null | undefined;
  /** Should only the direct search without any transit be done. */
  directOnly?: boolean | null | undefined;
  /**
   * Modes for different phases of an itinerary when transit is included. Also
   * includes street mode selections related to connecting to the transit network
   * and transfers. By default, all transit modes are usable.
   */
  transit?: PlanTransitModesInput | null | undefined;
  /**
   * Should only the transit search be done and never suggest itineraries that don't
   * contain any transit legs.
   */
  transitOnly?: boolean | null | undefined;
};

/**
 * One of the listed stop locations must be visited on-board a transit vehicle or the journey must
 * alight or board at the location.
 */
export type PlanPassThroughViaLocationInput = {
  /** The label/name of the location. This is pass-through information and is not used in routing. */
  label?: string | null | undefined;
  /**
   * A list of stop locations. A stop location can be a stop or a station.
   * It is enough to visit ONE of the locations listed.
   */
  stopLocationIds: Array<string>;
};

/** Wrapper type for different types of preferences related to plan query. */
export type PlanPreferencesInput = {
  /** Accessibility preferences that affect both the street and transit routing. */
  accessibility?: AccessibilityPreferencesInput | null | undefined;
  /**
   * Street routing preferences used for ingress, egress and transfers. These do not directly affect
   * the transit legs but can change how preferable walking or cycling, for example, is compared to
   * transit.
   */
  street?: PlanStreetPreferencesInput | null | undefined;
  /** Transit routing preferences used for transit legs. */
  transit?: TransitPreferencesInput | null | undefined;
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

/**
 * Street routing preferences used for ingress, egress and transfers. These do not directly affect
 * the transit legs but can change how preferable walking or cycling, for example, is compared to
 * transit.
 */
export type PlanStreetPreferencesInput = {
  /** Cycling related preferences. */
  bicycle?: BicyclePreferencesInput | null | undefined;
  /**
   * Car related preferences. These are not used for car travel as part of transit, such as
   * taxi travel.
   */
  car?: CarPreferencesInput | null | undefined;
  /** Scooter (kick or electrical) related preferences. */
  scooter?: ScooterPreferencesInput | null | undefined;
  /**
   * Walk related preferences. These are not used when walking a bicycle or a scooter as they
   * have their own preferences.
   */
  walk?: WalkPreferencesInput | null | undefined;
};

export type PlanTransferMode =
  /**
   * Cycling between transit vehicles (typically between stops). Note, this can
   * include walking when it's needed to walk the bicycle. Transfers can only use
   * cycling if the mode used for access and egress is also `BICYCLE`.
   */
  | 'BICYCLE'
  /**
   * Driving between transit vehicles. Transfers can only use driving if the mode
   * used for access and egress is also `CAR`.
   */
  | 'CAR'
  /** Walking between transit vehicles (typically between stops). */
  | 'WALK';

/** Transit mode and a reluctance associated with it. */
export type PlanTransitModePreferenceInput = {
  /** Costs related to using a transit mode. */
  cost?: TransitModePreferenceCostInput | null | undefined;
  /** Transit mode that could be (but doesn't have to be) used in an itinerary. */
  mode: TransitMode;
  /**
   * If present and not null, further limits the transit mode selection.  A transit trip matches
   * a PlanTransitModePreferenceInput if the mandatory TransitMode field mode matches. If replacement
   * is REQUIRED, the trip must also be a replacement. If replacement is FORBIDDEN,
   * the trip must not be a replacement. If replacement is FEATURE_IGNORED or missing, it
   * does not matter if the trip is a replacement or not. Whether a leg is a replacement is recognized
   * both by the NeTEx submode and the GTFS extended type, depending on the data source.
   * Note that a bus replacing a train has mode: BUS, replacement: true, so it matches a query with
   * mode: BUS, replacement: REQUIRED and mode: BUS, replacement: FEATURE_IGNORED, but it does not
   * match mode: TRAIN with any replacement options. So to get both trains and buses replacing them,
   * but no other buses, query [(mode: TRAIN), (mode: BUS, replacement: REQUIRED)].
   */
  replacement?: ReplacementFilterInput | null | undefined;
};

/**
 * Modes for different phases of an itinerary when transit is included. Also includes street
 * mode selections related to connecting to the transit network and transfers.
 */
export type PlanTransitModesInput = {
  /**
   * Street mode that is used when searching for access to the transit network from origin.
   * If more than one mode is selected, at least one of them must be used but not necessarily all.
   * There are modes that automatically also use walking such as the rental modes. To force rental
   * to be used, this should only include the rental mode and not `WALK` in addition.
   */
  access?: Array<PlanAccessMode> | null | undefined;
  /**
   * Street mode that is used when searching for egress to destination from the transit network.
   * If more than one mode is selected, at least one of them must be used but not necessarily all.
   * There are modes that automatically also use walking such as the rental modes. To force rental
   * to be used, this should only include the rental mode and not `WALK` in addition.
   */
  egress?: Array<PlanEgressMode> | null | undefined;
  /** Street mode that is used when searching for transfers. Selection of only one allowed for now. */
  transfer?: Array<PlanTransferMode> | null | undefined;
  /**
   * Transit modes and reluctances associated with them. Each defined mode can be used in
   * an itinerary but doesn't have to be. If direct search is not disabled, there can be an
   * itinerary without any transit legs. By default, all transit modes are usable. For a transit trip
   * to match PlanTransitModesInput, it must match one of the PlanTransitModePreferenceInputs given
   * in the field.
   */
  transit?: Array<PlanTransitModePreferenceInput> | null | undefined;
};

/**
 * A via-location is used to specifying a location as an intermediate place the router must
 * route through. The via-location is either a pass-through-location or a visit-via-location.
 */
export type PlanViaLocationInput = {
  /** Board, alight or pass-through(on-board) at the stop location. */
  passThrough?: PlanPassThroughViaLocationInput | null | undefined;
  /** Board or alight at a stop location or visit a coordinate. */
  visit?: PlanVisitViaLocationInput | null | undefined;
};

/**
 * A visit-via-location is a physical visit to one of the stop locations or coordinates listed. An
 * on-board visit does not count, the traveler must alight or board at the given stop for it to to
 * be accepted. To visit a coordinate, the traveler must walk(bike or drive) to the closest point
 * in the street network from a stop and back to another stop to join the transit network.
 */
export type PlanVisitViaLocationInput = {
  /**
   * A coordinate to route through. To visit a coordinate, the traveler must walk(bike or drive)
   * to the closest point in the street network from a stop and back to another stop to join the transit
   * network.
   */
  coordinate?: PlanCoordinateInput | null | undefined;
  /** The label/name of the location. This is pass-through information and is not used in routing. */
  label?: string | null | undefined;
  /**
   * The minimum wait time is used to force the trip to stay the given duration at the
   * via-location before the itinerary is continued.
   */
  minimumWaitTime?: unknown;
  /**
   * A list of stop locations. A stop location can be a stop or a station.
   * It is enough to visit ONE of the locations listed.
   */
  stopLocationIds?: Array<string> | null | undefined;
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

/** Contains details on how to filter trips based on the replacement feature when considering them for routing. */
export type ReplacementFilterInput = {
  /** One of three choices: must be replacement, cannot be a replacement, can either be or not be a replacement */
  requirement?: ReplacementRequirement | null | undefined;
};

/** How does a trip's replacement feature affect whether a it is considered for use in routing? */
export type ReplacementRequirement =
  /** Consider all trips ignoring their replacement feature. */
  | 'FEATURE_IGNORED'
  /** Only consider trips which don't have the replacement feature. */
  | 'FORBIDDEN'
  /** Only consider trips which have the replacement feature. */
  | 'REQUIRED';

export type RoutingErrorCode =
  /**
   * The specified location is not close to any streets or transit stops currently loaded into the
   * system, even though it is generally within its bounds.
   *
   * This can happen when there is only transit but no street data coverage at the location in
   * question.
   */
  | 'LOCATION_NOT_FOUND'
  /**
   * No usable itineraries were found for the requested direct mode (e.g. walking, cycling, car, flex)
   * and no transit modes were included in the search. This is returned both when no route exists and
   * when routes were found but didn't pass quality filters.
   */
  | 'NO_DIRECT_MODE_CONNECTION'
  /**
   * No stops are reachable from the start or end locations specified.
   *
   * You can try searching using a different access or egress mode, for example cycling instead of walking,
   * increase the walking/cycling/driving speed or have an administrator change the system's configuration
   * so that stops further away are considered.
   */
  | 'NO_STOPS_IN_RANGE'
  /**
   * No transit connection was found between the origin and destination within the operating day or
   * the next day, not even sub-optimal ones.
   */
  | 'NO_TRANSIT_CONNECTION'
  /**
   * A transit connection was found, but it was outside the search window. See the metadata for a token
   * for retrieving the result outside the search window.
   */
  | 'NO_TRANSIT_CONNECTION_IN_SEARCH_WINDOW'
  /**
   * The coordinates are outside the geographic bounds of the transit and street data currently loaded
   * into the system and therefore cannot return any results.
   */
  | 'OUTSIDE_BOUNDS'
  /**
   * The date specified is outside the range of data currently loaded into the system as it is too
   * far into the future or the past.
   *
   * The specific date range of the system is configurable by an administrator and also depends on
   * the input data provided.
   */
  | 'OUTSIDE_SERVICE_PERIOD'
  /**
   * Transit connections were requested and found but because it is easier to just walk all the way
   * to the destination they were removed.
   *
   * If you want to still show the transit results, you need to make walking less desirable by
   * increasing the walk reluctance.
   */
  | 'WALKING_BETTER_THAN_TRANSIT';

/** What criteria should be used when optimizing a scooter route. */
export type ScooterOptimizationInput = {
  /** Define optimization by weighing three criteria. */
  triangle?: TriangleScooterFactorsInput | null | undefined;
  /** Use one of the predefined optimization types. */
  type?: ScooterOptimizationType | null | undefined;
};

/**
 * Predefined optimization alternatives for scooter routing. For more customization,
 * one can use the triangle factors.
 */
export type ScooterOptimizationType =
  /** Emphasize flatness over safety or duration of the route. This option was previously called `FLAT`. */
  | 'FLAT_STREETS'
  /**
   * Completely ignore the elevation differences and prefer the streets, that are evaluated
   * to be safest for scooters, even more than with the `SAFE_STREETS` option.
   * Safety can also include other concerns such as convenience and general preferences by taking
   * into account road surface etc.  Note, currently the same criteria is used both for cycling and
   * scooter travel to determine how safe streets are for cycling or scooter.
   * This option was previously called `GREENWAYS`.
   */
  | 'SAFEST_STREETS'
  /**
   * Emphasize scooter safety over flatness or duration of the route. Safety can also include other
   * concerns such as convenience and general preferences by taking into account road surface etc.
   * Note, currently the same criteria is used both for cycling and scooter travel to determine how
   * safe streets are for cycling or scooter. This option was previously called `SAFE`.
   */
  | 'SAFE_STREETS'
  /**
   * Search for routes with the shortest duration while ignoring the scooter safety
   * of the streets. The routes should still follow local regulations, but currently scooters
   * are only allowed on the same streets as bicycles which might not be accurate for each country
   * or with different types of scooters. Routes can include steep streets, if they are
   * the fastest alternatives. This option was previously called `QUICK`.
   */
  | 'SHORTEST_DURATION';

/** Preferences related to travel with a scooter (kick or e-scooter). */
export type ScooterPreferencesInput = {
  /** What criteria should be used when optimizing a scooter route. */
  optimization?: ScooterOptimizationInput | null | undefined;
  /**
   * A multiplier for how bad riding a scooter is compared to being in transit
   * for equal lengths of time.
   */
  reluctance?: unknown;
  /** Scooter rental related preferences. */
  rental?: ScooterRentalPreferencesInput | null | undefined;
  /**
   * Maximum speed on flat ground while riding a scooter. Note, this speed is higher than
   * the average speed will be in itineraries as this is the maximum speed but there are
   * factors that slow down the travel such as crossings, intersections and elevation changes.
   */
  speed?: unknown;
};

/** Preferences related to scooter rental (station based or floating scooter rental). */
export type ScooterRentalPreferencesInput = {
  /**
   * Rental networks which can be potentially used as part of an itinerary. If this field has no default value,
   * it means that all networks are allowed unless some are banned with `bannedNetworks`.
   */
  allowedNetworks?: Array<string> | null | undefined;
  /** Rental networks which cannot be used as part of an itinerary. */
  bannedNetworks?: Array<string> | null | undefined;
  /**
   * Is it possible to arrive to the destination with a rented scooter and does it
   * come with an extra cost.
   */
  destinationScooterPolicy?: DestinationScooterPolicyInput | null | undefined;
};

export type TimetablePreferencesInput = {
  /**
   * When false, real-time updates are considered during the routing.
   * In practice, when this option is set as true, some of the suggestions might not be
   * realistic as the transfers could be invalid due to delays,
   * trips can be canceled or stops can be skipped.
   */
  excludeRealTimeUpdates?: boolean | null | undefined;
  /**
   * When true, departures that have been canceled ahead of time will be
   * included during the routing. This means that an itinerary can include
   * a canceled departure while some other alternative that contains no cancellations
   * could be filtered out as the alternative containing a cancellation would normally
   * be better.
   */
  includePlannedCancellations?: boolean | null | undefined;
  /**
   * When true, departures that have been canceled through a real-time feed will be
   * included during the routing. This means that an itinerary can include
   * a canceled departure while some other alternative that contains no cancellations
   * could be filtered out as the alternative containing a cancellation would normally
   * be better. This option can't be set to true while `includeRealTimeUpdates` is false.
   */
  includeRealTimeCancellations?: boolean | null | undefined;
};

/** Preferences related to transfers between transit vehicles (typically between stops). */
export type TransferPreferencesInput = {
  /** A static cost that is added for each transfer on top of other costs. */
  cost?: unknown;
  /**
   * How many additional transfers there can be at maximum compared to the itinerary with the
   * least number of transfers.
   */
  maximumAdditionalTransfers?: number | null | undefined;
  /** How many transfers there can be at maximum in an itinerary. */
  maximumTransfers?: number | null | undefined;
  /**
   * A global minimum transfer time that specifies the minimum amount of time that must pass
   * between exiting one transit vehicle and boarding another. This time is in addition to
   * time it might take to walk between transit stops. Setting this value as `PT0S`, for
   * example, can lead to passenger missing a connection when the vehicle leaves ahead of time
   * or the passenger arrives to the stop later than expected.
   */
  slack?: unknown;
};

/**
 * A collection of selectors for what routes/agencies should be included in or excluded from the search.
 *
 * The `include` is always applied to select the initial set, then `exclude` to remove elements.
 * If only `exclude` is present, the exclude is applied to the existing set of results.
 *
 * Therefore, if an entity is both included _and_ excluded the exclusion takes precedence.
 */
export type TransitFilterInput = {
  /**
   * A list of selectors for what routes/agencies should be excluded during search.
   *
   * In order to be excluded, a route/agency has to match with at least one selector.
   *
   * An empty list or a list containing `null` is forbidden.
   */
  exclude?: Array<TransitFilterSelectInput> | null | undefined;
  /**
   * A list of selectors for what routes/agencies should be allowed during the search.
   *
   * If route/agency matches with at least one selector it will be included.
   *
   * An empty list or a list containing `null` is forbidden.
   */
  include?: Array<TransitFilterSelectInput> | null | undefined;
};

/**
 * A list of selectors for including or excluding entities from the routing results. Null
 * means everything is allowed to be returned and empty lists are not allowed.
 */
export type TransitFilterSelectInput = {
  /**
   * Set of ids for agencies that should be included in/excluded from the search.
   *
   * Format: `FeedId:AgencyId`
   */
  agencies?: Array<string> | null | undefined;
  /**
   * Set of ids for routes that should be included in/excluded from the search.
   *
   * Format: `FeedId:AgencyId`
   */
  routes?: Array<string> | null | undefined;
};

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

/** Costs related to using a transit mode. */
export type TransitModePreferenceCostInput = {
  /** A cost multiplier of transit leg travel time. */
  reluctance: unknown;
};

/** Transit routing preferences used for transit legs. */
export type TransitPreferencesInput = {
  /** Preferences related to alighting from a transit vehicle. */
  alight?: AlightPreferencesInput | null | undefined;
  /**
   * Preferences related to boarding a transit vehicle. Note, board costs for each street mode
   * can be found under the street mode preferences.
   */
  board?: BoardPreferencesInput | null | undefined;
  /**
   * A list of filters for which trips should be included or excluded. A trip will be considered in the
   * result if it is included by at least one filter and isn't excluded by another one at the same time.
   *
   * An empty list of filters or no value means that all trips should be included.
   *
   * **AND/OR Logic**
   *
   * Several filters can be defined and form an OR-condition.
   *
   * The following example means "include all trips with `F:route1` _or_ `F:agency1`":
   *
   * ```
   * filters: [
   *   {
   *     include: {
   *       routes: ["F:route1"]
   *     }
   *   },
   *   {
   *     include: {
   *       agencies: ["F:agency1"]
   *     }
   *   }
   * }]
   * ```
   *
   * The following example means "include all trips of `F:agency1` _and_ exclude `F:route1`":
   *
   * ```
   * filters: [
   *   {
   *     include: {
   *       agencies: ["F:agency1"]
   *     },
   *     exclude: {
   *       routes: ["F:route1"]
   *     }
   *   }
   * ]
   * ```
   *
   * Be aware of the following pitfalls:
   *   - It is easy to construct AND-conditions that can lead to zero results.
   *   - OR-conditions that have an element which consists of only an exclude are likely to be
   *     unwanted and may lead to unexpected results.
   *
   * **Note**: This parameter also interacts with the modes set in `modes.transit` by forming
   * an AND-condition.
   */
  filters?: Array<TransitFilterInput> | null | undefined;
  /**
   * Relax generalized-cost when comparing itineraries with a different set of
   * transit-group-priorities. The groups are set server side for routes and
   * can not be configured in the API.
   *
   * This relaxes the comparison inside the routing engine for each stop-arrival. If two
   * paths have a different set of transit-group-priorities, then the generalized-cost
   * comparison is relaxed. The final set of paths are filtered through the normal
   * itinerary-filters.
   *
   * A relax-cost is used to increase the limit when comparing one cost to another cost
   * using a linear function applied to the generalized cost.
   * This is used to include more results into the result. A `coefficient=2.0` means a path (itinerary)
   * with twice as high cost as another one, is accepted. A `constant=300` means a "fixed"
   * constant is added to the limit.
   */
  relaxTransitGroupPriority?: LinearCostFunctionInput | null | undefined;
  /** Preferences related to cancellations and real-time. */
  timetable?: TimetablePreferencesInput | null | undefined;
  /** Preferences related to transfers between transit vehicles (typically between stops). */
  transfer?: TransferPreferencesInput | null | undefined;
};

/**
 * Relative importance of optimization factors. Only effective for bicycling legs.
 * Invariant: `safety + flatness + time == 1`
 */
export type TriangleCyclingFactorsInput = {
  /** Relative importance of flat terrain */
  flatness: unknown;
  /**
   * Relative importance of cycling safety, but this factor can also include other
   * concerns such as convenience and general cyclist preferences by taking into account
   * road surface etc.
   */
  safety: unknown;
  /** Relative importance of duration */
  time: unknown;
};

/**
 * Relative importance of optimization factors. Only effective for scooter legs.
 * Invariant: `safety + flatness + time == 1`
 */
export type TriangleScooterFactorsInput = {
  /** Relative importance of flat terrain */
  flatness: unknown;
  /**
   * Relative importance of scooter safety, but this factor can also include other
   * concerns such as convenience and general scooter preferences by taking into account
   * road surface etc.
   */
  safety: unknown;
  /** Relative importance of duration */
  time: unknown;
};

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

/** Preferences related to walking (excluding walking a bicycle or a scooter). */
export type WalkPreferencesInput = {
  /** The cost of boarding a vehicle while walking. */
  boardCost?: unknown;
  /** A multiplier for how bad walking is compared to being in transit for equal lengths of time. */
  reluctance?: unknown;
  /**
   * Factor for how much the walk safety is considered in routing. Value should be between 0 and 1.
   * If the value is set to be 0, safety is ignored.
   */
  safetyFactor?: unknown;
  /**
   * Maximum walk speed on flat ground. Note, this speed is higher than the average speed
   * will be in itineraries as this is the maximum speed but there are
   * factors that slow down walking such as crossings, intersections and elevation changes.
   */
  speed?: unknown;
};

/**
 * Wheelchair related preferences. Note, this is the only from of accessibilty available
 * currently and is sometimes is used for other accessibility needs as well.
 */
export type WheelchairPreferencesInput = {
  /**
   * Is wheelchair accessibility considered in routing. Note, this does not guarantee
   * that the itineraries are wheelchair accessible as there can be data issues.
   */
  enabled?: boolean | null | undefined;
};
