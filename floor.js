{
    init: function(elevators, floors) {

    	var MAX_FLOOR = floors.length - 1;
    	var COUNT_ELEVATORS_ACTIVE = elevators.length;	// limit # of elevators used to this value
    	if ( COUNT_ELEVATORS_ACTIVE > elevators.length ) {
    		COUNT_ELEVATORS_ACTIVE = elevators.length;
    	}
   
    	var waitingForFloor = function(floorNum, direction) {
			var floor = floors[floorNum];
			return (floor.buttonStates[direction] == "activated" );
    	};
    	var floorHasPeopleWaiting = function(floorNum) {
    		return ( waitingForFloor(floorNum,"up") || waitingForFloor(floorNum,"down") );
    	};
    	var shouldPickupFromFloor = function(elevator, floorNum, direction) {
    		if (elevator.loadFactor() >= 0.99 ) {
    			return false;
    		}
    		return waitingForFloor(floorNum, direction);
    	};
    	var passengersWantFloor = function(elevator, floor) {
    		var jj = _.filter(elevator.getPressedFloors(), function(n) {
    			return n == floor;
    		});
    		return jj.length > 0;
    	};
    	var elevatorIsIdle = function(elevator) {
    		return (elevator.destinationQueue.length == 0);
    	};
    	var goToFloor = function(elevator, floorNum, immediately) {
    		// if ( elevator.currentFloor() > floorNum ) {
    		// 	elevator.goingUpIndicator(false);
    		// 	elevator.goingDownIndicator(true);
    		// } else {
    		// 	elevator.goingUpIndicator(true);
    		// 	elevator.goingDownIndicator(false);
    		// }
    		elevator.goToFloor(floorNum, immediately);
           
    	};
    	var nearestFloorWithPeople = function(elevator) {
    		var d = 9999;	// infinity
    		var cur = elevator.currentFloor();
    		var finalFloor = -1;
    		_.each(floors, function(floor) {
    			var f = floor.floorNum();
    			var dist = Math.abs(cur - f);
    			if (  (dist < d) && floorHasPeopleWaiting(f) ) {
    				d = dist;
    				finalFloor = f;
    			}
    		});
    		return finalFloor;
    	};
    	var furthestFloorWithPeople = function(elevator) {
    		var d = 0;	// infinity
    		var cur = elevator.currentFloor();
    		var finalFloor = -1;
    		_.each(floors, function(floor) {
    			var f = floor.floorNum();
    			var dist = Math.abs(cur - f);
    			if (  (dist > d) && floorHasPeopleWaiting(f) ) {
    				d = dist;
    				finalFloor = f;
    			}
    		});
    		return finalFloor;
    	};

    	var callIdleElevatorToFloor = function(floorNum) {
    		var dist = 9999;	// infinity
    		var elevatorToCall = undefined;
    		_.each(elevators, function(elevator) {
    			if ( elevatorIsIdle(elevator) ) {
    				var d = Math.abs(elevator.currentFloor() - floorNum);
    				if ( d < dist ) {
    					dist = d;
    					elevatorToCall = elevator;
    				}
    			}
    		});
    		if ( elevatorToCall ) {
    			goToFloor(elevatorToCall, floorNum);
    		}
    	};

    	// floor events
    	_.each(floors, function(floor) {
		    floor.on("up_button_pressed", function(event) {
		    	// callIdleElevatorToFloor(floor.floorNum());
		    });
		    floor.on("down_button_pressed", function(event) {
		    	//callIdleElevatorToFloor(floor.floorNum());
		    });
    	});

    	// elevator  events
		var initElevator = function(elevator, i) {

 			elevator.id = i;
            elevator.on("idle", function() { 
            	var flr = furthestFloorWithPeople(elevator);
            	if ( flr >= 0 ) {
            		goToFloor(elevator, flr);
            	}
            });
            elevator.on("floor_button_pressed", function(floorNum) {
            	if ( elevatorIsIdle(elevator) ) {
            		goToFloor(elevator, floorNum);
            	}
            });
            elevator.on("passing_floor", function(floorNum, direction) {
            	if ( shouldPickupFromFloor(elevator, floorNum, direction) ||  passengersWantFloor(elevator, floorNum)) {
	            	goToFloor(elevator, floorNum,1);            		
            	}
            });
		};

		var index = 0;
		_.each(elevators, function(elevator) {
			var idx = index++;
			if ( idx < COUNT_ELEVATORS_ACTIVE ) {
        		setTimeout(function() {
        			initElevator(elevator, idx);	
        		}, 100*idx);
        	} else {
        		disableElevator(elevator);
        	}
      	});   	
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}




// var disableElevator = function(elevator) {
// 	var dest = MAX_FLOOR;
// 	elevator.gotoFloor(1);
// 	// elevator.on("passing_floor", function(floorNum, direction) {
// 	// // 	if ( floorNum == elevator.dest ) {
// 	// // 		dest = MAX_FLOOR - dest;
// 	// // 		elevator.gotoFloor(dest, 1);
// 	// // 	}
// 	// });
// };
