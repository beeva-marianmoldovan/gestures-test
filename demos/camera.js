/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as posenet from '@tensorflow-models/posenet';
import dat from 'dat.gui';
import Stats from 'stats.js';
import {drawKeypoints, drawSkeleton, drawBoundingBox} from './demo_util';

const videoWidth = 600;
const videoHeight = 500;
const stats = new Stats();
var leftPoseHistory = [];
var rightPoseHistory = [];

var mockOpenRight = [
  {x:250, y:250},
  {x:249, y:251},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:130, y:252},
  {x:102, y:253},
  {x:100, y:255}
];

var mockOpenLeft = [
  {x:270, y:251},
  {x:272, y:251},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:250, y:250},
  {x:400, y:252},
  {x:418, y:253},
  {x:420, y:255}
];

var mockUpLeft = [
  {x: 271, y: 250},
  {x: 270, y: 235},
  {x: 270, y: 234},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 271, y: 26},
  {x: 272, y: 30},
  {x: 272, y: 20}
]

var mockUpRight = [
  {x: 225, y: 240},
  {x: 226, y: 238},
  {x: 270, y: 235},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 227, y: 40},
  {x: 228, y: 38},
  {x: 230, y: 32}
]

var mockVLeft = [
  {x: 270, y: 250},
  {x: 272, y: 248},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 368, y: 32},
  {x: 370, y: 30}
]

var mockVRight = [
  {x: 250, y: 250},
  {x: 248, y: 248},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 152, y: 350},
  {x: 150, y: 350}
]


var mockPerpLeft = [
  {x: 250, y: 250},
  {x: 252, y: 248},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 428, y: 252},
  {x: 430, y: 251}
]

var mockPerpRight = [
  {x: 230, y: 250},
  {x: 231, y: 248},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 270, y: 250},
  {x: 230, y: 28},
  {x: 229, y: 30}
]

function detectGesture() {
  if(leftPoseHistory.length > 15)
    leftPoseHistory = leftPoseHistory.slice(leftPoseHistory.length - 15, leftPoseHistory.length)
  if(rightPoseHistory.length > 15)
    rightPoseHistory = rightPoseHistory.slice(rightPoseHistory.length - 15, rightPoseHistory.length)
  
    if(rightPoseHistory.length > 14) {
      let rDir, lDir;
      rDir = getDirection(rightPoseHistory);
      lDir = getDirection(leftPoseHistory);
      // if(rDir !== undefined)
      //   console.log('Dir-right: ',rDir)
      // if(lDir !== undefined)
      //   console.log('Dir-left: ',lDir)
      // console.log('Separacion: ', getDistance(leftPoseHistory, rightPoseHistory))

      // console.log('Paralelas: ', getSlope(leftPoseHistory, rightPoseHistory))

      if(getSlope(leftPoseHistory, rightPoseHistory) === 1 && getDistance(leftPoseHistory, rightPoseHistory) === 1)
        console.log('Zoom OUT')
      if(getSlope(leftPoseHistory, rightPoseHistory) === 1 && getDistance(leftPoseHistory, rightPoseHistory) === -1)
        console.log('Zoom IN')
      // console.log('---------------------MOCK----------------------------');
      // console.log('Right: ', getDirection(mockVLeft));
      // console.log('Left: ',getDirection(mockVRight));
      // console.log('Separacion: ', getDistance(mockVLeft, mockVRight))
      // console.log('Paralelas: ', getSlope(mockVLeft, mockVRight))
      // console.log('---------------------FIN MOCK----------------------------');

    }

  // console.log('-------------------------------------------------');
}

function getDirection(arr) {
  let rightCount = arr[0].x;
  let leftCount = arr[0].x;;
  // for(let i = 1; i<arr.length-1; i++){
  //   if(arr[i].x < arr[i+1].x) {
  //     rightCount =+ arr[i].x;
  //   }
  //   else {
  //     rightCount =- arr[i].x;
  //   }
  //   if(arr[i].x > arr[i+1].x) {
  //     leftCount =+ arr[i].x;
  //   }
  //   else {
  //     leftCount =- arr[i].x;
  //   }
  // }
  //console.log('RR:', rightCount, 'LL: ', leftCount)
  if(arr[14].x - arr[0].x > 60 || arr[14].x - arr[0].x < -60)
    return 'horizontal';
  if(arr[14].y - arr[0].y > 60 || arr[14].y - arr[0].y < -60)
    return 'vertical';
}

// Suponemos que las 2 manos se mueven al mismo tiempo
function getDistance(left, right) {
  if(left[14].x - left[0].x > 50 && right[14].x - right[0].x < -50) // Se han movido las 2 manos alejandose 50 puntos cada una de su punto de origen
    return 1; // Se aleja
  else if(left[14].x - left[0].x < -50 && right[14].x - right[0].x > 50) // Se han acercado las 2 manos 50 puntos desde su origen
    return -1; // Se acerca
  else // Pueden no haberse movido o pueden haberse movido pero no lo suficiente
    return 0;
}

function getSlope(left, right) {
  let l1, l2;

  // console.log('y2',left[14].y , 'y1',left[1].y , 'x2', left[14].x, 'x1', left[1].x);
  // console.log('y2',right[14].y , 'y1',right[1].y , 'x2', right[14].x, 'x1', right[1].x);
  l1 = (left[14].y - left[1].y) / (left[14].x - left[1].x);
  l2 = (right[14].y - right[1].y) / (right[14].x - right[1].x);
  // console.log('l1: ', l1 , 'l2', l2)
  
  if (l1 * l2 > -1.1 && l1 * l2 < -0.9) // Perpendiculares
    return -1
  else if(Math.abs(l1 - l2) > 0 && Math.abs(l1 - l2) < 2) // Paralelas
    return 1;
  else // Se cruzan
    return 0;
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

const guiState = {
  algorithm: 'single-pose',
  input: {
    mobileNetArchitecture: isMobile() ? '0.50' : '1.00',
    outputStride: 16,
    imageScaleFactor: 0.33,
  },
  singlePoseDetection: {
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
  },
  multiPoseDetection: {
    maxPoseDetections: 5,
    minPoseConfidence: 0.15,
    minPartConfidence: 0.1,
    nmsRadius: 30.0,
  },
  output: {
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    showBoundingBox: false,
  },
  net: null,
};

/**
 * Sets up dat.gui controller on the top-right of the window
 */
function setupGui(cameras, net) {
  guiState.net = net;

  if (cameras.length > 0) {
    guiState.camera = cameras[0].deviceId;
  }

  const gui = new dat.GUI({width: 300});

  // The single-pose algorithm is faster and simpler but requires only one
  // person to be in the frame or results will be innaccurate. Multi-pose works
  // for more than 1 person
  const algorithmController =
      gui.add(guiState, 'algorithm', ['single-pose', 'multi-pose']);

  // The input parameters have the most effect on accuracy and speed of the
  // network
  let input = gui.addFolder('Input');
  // Architecture: there are a few PoseNet models varying in size and
  // accuracy. 1.01 is the largest, but will be the slowest. 0.50 is the
  // fastest, but least accurate.
  const architectureController = input.add(
      guiState.input, 'mobileNetArchitecture',
      ['1.01', '1.00', '0.75', '0.50']);
  // Output stride:  Internally, this parameter affects the height and width of
  // the layers in the neural network. The lower the value of the output stride
  // the higher the accuracy but slower the speed, the higher the value the
  // faster the speed but lower the accuracy.
  input.add(guiState.input, 'outputStride', [8, 16, 32]);
  // Image scale factor: What to scale the image by before feeding it through
  // the network.
  input.add(guiState.input, 'imageScaleFactor').min(0.2).max(1.0);
  input.open();

  // Pose confidence: the overall confidence in the estimation of a person's
  // pose (i.e. a person detected in a frame)
  // Min part confidence: the confidence that a particular estimated keypoint
  // position is accurate (i.e. the elbow's position)
  let single = gui.addFolder('Single Pose Detection');
  single.add(guiState.singlePoseDetection, 'minPoseConfidence', 0.0, 1.0);
  single.add(guiState.singlePoseDetection, 'minPartConfidence', 0.0, 1.0);

  let multi = gui.addFolder('Multi Pose Detection');
  multi.add(guiState.multiPoseDetection, 'maxPoseDetections')
      .min(1)
      .max(20)
      .step(1);
  multi.add(guiState.multiPoseDetection, 'minPoseConfidence', 0.0, 1.0);
  multi.add(guiState.multiPoseDetection, 'minPartConfidence', 0.0, 1.0);
  // nms Radius: controls the minimum distance between poses that are returned
  // defaults to 20, which is probably fine for most use cases
  multi.add(guiState.multiPoseDetection, 'nmsRadius').min(0.0).max(40.0);
  multi.open();

  let output = gui.addFolder('Output');
  output.add(guiState.output, 'showVideo');
  output.add(guiState.output, 'showSkeleton');
  output.add(guiState.output, 'showPoints');
  output.add(guiState.output, 'showBoundingBox');
  output.open();


  architectureController.onChange(function(architecture) {
    guiState.changeToArchitecture = architecture;
  });

  algorithmController.onChange(function(value) {
    switch (guiState.algorithm) {
      case 'single-pose':
        multi.close();
        single.open();
        break;
      case 'multi-pose':
        single.close();
        multi.open();
        break;
    }
  });
}

/**
 * Sets up a frames per second panel on the top-left of the window
 */
function setupFPS() {
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);
}

/**
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */
function detectPoseInRealTime(video, net) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');
  // since images are being fed from a webcam
  const flipHorizontal = true;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    if (guiState.changeToArchitecture) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose();

      // Load the PoseNet model weights for either the 0.50, 0.75, 1.00, or 1.01
      // version
      guiState.net = await posenet.load(+guiState.changeToArchitecture);

      guiState.changeToArchitecture = null;
    }

    // Begin monitoring code for frames per second
    stats.begin();

    // Scale an image down to a certain factor. Too large of an image will slow
    // down the GPU
    const imageScaleFactor = guiState.input.imageScaleFactor;
    const outputStride = +guiState.input.outputStride;

    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;
    switch (guiState.algorithm) {
      case 'single-pose':
        const pose = await guiState.net.estimateSinglePose(
            video, imageScaleFactor, flipHorizontal, outputStride);
        poses.push(pose);

        let leftWristKeypoints = pose.keypoints.filter(item => item.part === 'leftWrist')
        let leftKeypoint = leftWristKeypoints.map(item => {
            if(item.score > 0.66)
              return item.position
            else return {x:0,y:0}
        })[0]
        let rightWristKeypoints = pose.keypoints.filter(item => item.part === 'rightWrist')
        let rightKeypoints = rightWristKeypoints.map(item => {
            if(item.score > 0.66)
              return item.position
            else return {x:0,y:0}
        })[0]
        if(leftKeypoint)
          leftPoseHistory.push(leftKeypoint);
        if(rightKeypoints)
          rightPoseHistory.push(rightKeypoints)
        detectGesture()

        minPoseConfidence = +guiState.singlePoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.singlePoseDetection.minPartConfidence;
        break;
      case 'multi-pose':
        poses = await guiState.net.estimateMultiplePoses(
            video, imageScaleFactor, flipHorizontal, outputStride,
            guiState.multiPoseDetection.maxPoseDetections,
            guiState.multiPoseDetection.minPartConfidence,
            guiState.multiPoseDetection.nmsRadius);

        minPoseConfidence = +guiState.multiPoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.multiPoseDetection.minPartConfidence;
        break;
    }

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (guiState.output.showVideo) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-videoWidth, 0);
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      ctx.restore();
    }

    // For each pose (i.e. person) detected in an image, loop through the poses
    // and draw the resulting skeleton and keypoints if over certain confidence
    // scores
    poses.forEach(({score, keypoints}) => {
      if (score >= minPoseConfidence) {
        if (guiState.output.showPoints) {
          let filteredKeypoints = keypoints.filter(item => item.part === 'leftWrist' || item.part === 'rightWrist')
          drawKeypoints(filteredKeypoints, minPartConfidence, ctx);
        }
        if (guiState.output.showSkeleton) {
          drawSkeleton(keypoints, minPartConfidence, ctx);
        }
        if (guiState.output.showBoundingBox) {
          //drawBoundingBox(keypoints, ctx);
        }
      }
    });

    // End monitoring code for frames per second
    stats.end();

    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();

}

/**
 * Kicks off the demo by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
export async function bindPage() {
  // Load the PoseNet model weights with architecture 0.75
  const net = await posenet.load(0.75);

  document.getElementById('loading').style.display = 'none';
  document.getElementById('main').style.display = 'block';

  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture,' +
        'or this device does not have a camera';
    info.style.display = 'block';
    throw e;
  }

  setupGui([], net);
  setupFPS();
  detectPoseInRealTime(video, net);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// kick off the demo
bindPage();
