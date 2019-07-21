var drive_cmd;
var drive_node;
var publishImmidiately = true;
var robot_IP;
var manager;
var teleop;
var ros;
var listener;
var turn_range = 1;
var speed_range = 1;
function moveAction(RPM, turn) {
  if (RPM !== undefined && turn !== undefined) {
    drive_cmd.rpm = Math.floor(RPM * 100);
    drive_cmd.steer_pct = turn * 20;
  } else {
    drive_cmd.rpm = 0;
    drive_cmd.steer_pct = 0;
  }
  console.log(drive_cmd);
  drive_node.publish(drive_cmd);
}

function initVelocityPublisher() {
  // Init message with zero values.
  drive_cmd = new ROSLIB.Message({
    rpm: 0,
    steer_pct: 0.0
  });
  // Init ros publisher
  drive_node = new ROSLIB.Topic({
    ros: ros,
    name: "/core_rover/driver/drive_cmd",
    messageType: "nova_common/DriveCmd"
  });
  // Register publisher within ROS system
  drive_node.advertise();

  // Init ros subscriber
  listener = new ROSLIB.Topic({
    ros: ros,
    name: "/core_rover/driver/drive_cmd",
    messageType: "nova_common/DriveCmd"
  });

  listener.subscribe(function(message) {
    console.log("Received message on " + listener.name + ": " + message.rpm);
  });
}

function initSliders() {
  // Add event listener for slider moves
  //Scaler between 0.15-1 for full RPM
  robotSpeedRange = document.getElementById("robot-speed");
  robotSpeedRange.oninput = function() {
    speed_range = robotSpeedRange.value / 100;
    console.log(speed_range);
  };
  //Scaler between 0.15-1 for full turn
  robotTurnRange = document.getElementById("robot-turn");
  robotTurnRange.oninput = function() {
    turn_range = robotTurnRange.value / 100;
    console.log(turn_range);
  };
}

function createJoystick() {
  // Check if joystick was aready created
  if (manager == null) {
    joystickContainer = document.getElementById("joystick");
    // joystck configuration
    var options = {
      zone: joystickContainer,
      position: { left: 50 + "%", top: 105 + "px" },
      mode: "static",
      size: 200,
      color: "#0066ff",
      restJoystick: true
    };
    manager = nipplejs.create(options);
    // event listener for joystick move
    manager.on("move", function(evt, nipple) {
      // turn 90 degrees to be facing upwards
      var direction = 90 - nipple.angle.degree;
      if (direction < -180) {
        direction = 450 - nipple.angle.degree;
      }
      // convert angles to radians and scale to RPM and turn
      var RPM =
        Math.cos(direction / 57.29) * nipple.distance * 0.005 * speed_range;
      var turn =
        Math.sin(direction / 57.29) * nipple.distance * 0.05 * turn_range;
      // events triggered earlier than 50ms after last publication will be dropped
      if (publishImmidiately) {
        publishImmidiately = false;
        moveAction(RPM, turn);
        setTimeout(function() {
          publishImmidiately = true;
        }, 50);
      }
    });
    // event listener for joystick release, always send stop message
    manager.on("end", function() {
      moveAction(0, 0);
    });
  }
}

window.onload = function() {
  // IP address off the ros-bridge-server
  robot_IP = "192.168.0.6";

  // // Init handle for rosbridge_websocket
  ros = new ROSLIB.Ros({
    url: "ws://" + robot_IP + ":9090" //ros-bridge-server by default runs on port 9090
  });

  initVelocityPublisher();
  // get handle for video placeholder
  video = document.getElementById("video");
  // Populate video source
  video.src =
    "http://" +
    robot_IP +
    ":8080/stream?topic=/camera/rgb/image_raw&type=mjpeg&quality=80";

  createJoystick();
  initSliders();
  video.onload = function() {
    // joystick and keyboard controls will be available only when video is correctly loaded
    createJoystick();
    initTeleopKeyboard();
  };
};
