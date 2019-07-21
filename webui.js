var twist;
var cmdVel;
var publishImmidiately = true;
var robot_IP;
var manager;
var teleop;
var ros;
var listener;
var turn_range = 1;
var speed_range = 1;
function moveAction(linear, angular) {
  if (linear !== undefined && angular !== undefined) {
    twist.rpm = Math.floor(linear * 100);
    twist.steer_pct = angular * 20;
  } else {
    twist.rpm = 0;
    twist.steer_pct = 0;
  }
  console.log(twist);
  cmdVel.publish(twist);
}

function initVelocityPublisher() {
  // Init message with zero values.
  twist = new ROSLIB.Message({
    rpm: 0,
    steer_pct: 0.0
  });
  // Init topic object
  cmdVel = new ROSLIB.Topic({
    ros: ros,
    name: "/core_rover/driver/drive_cmd",
    messageType: "nova_common/DriveCmd"
  });
  // Register publisher within ROS system
  cmdVel.advertise();

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
  robotSpeedRange = document.getElementById("robot-speed");
  robotSpeedRange.oninput = function() {
    speed_range = robotSpeedRange.value / 100;
    console.log(speed_range);
  };
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
    // joystck configuration, if you want to adjust joystick, refer to:
    // https://yoannmoinet.github.io/nipplejs/
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
      // nipplejs returns direction is screen coordiantes
      // we need to rotate it, that dragging towards screen top will move robot forward
      var direction = 90 - nipple.angle.degree;
      if (direction < -180) {
        direction = 450 - nipple.angle.degree;
      }
      // convert angles to radians and scale linear and angular speed
      // adjust if you want robot to drvie faster or slower
      var lin =
        Math.cos(direction / 57.29) * nipple.distance * 0.005 * speed_range;
      var ang =
        Math.sin(direction / 57.29) * nipple.distance * 0.05 * turn_range;
      // nipplejs is triggering events when joystic moves each pixel
      // we need delay between consecutive messege publications to
      // prevent system from being flooded by messages
      // events triggered earlier than 50ms after last publication will be dropped
      if (publishImmidiately) {
        publishImmidiately = false;
        moveAction(lin, ang);
        setTimeout(function() {
          publishImmidiately = true;
        }, 50);
      }
    });
    // event litener for joystick release, always send stop message
    manager.on("end", function() {
      moveAction(0, 0);
    });
  }
}

window.onload = function() {
  // determine robot address automatically
  // robot_IP = location.hostname;
  // set robot address statically
  robot_IP = "192.168.0.6";

  // // Init handle for rosbridge_websocket
  ros = new ROSLIB.Ros({
    url: "ws://" + robot_IP + ":9090"
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
