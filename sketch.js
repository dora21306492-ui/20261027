let walkSprite; // 儲存向右行走的精靈圖。
let backwalkSprite; // 儲存向左行走的精靈圖。
let idleSprite; // 儲存原地待機的精靈圖。
let jumpSprite; // 儲存跳躍動作的精靈圖。
let characterX; // 儲存角色畫面上的水平位置。
let characterY; // 儲存角色畫面上的垂直位置。
let verticalVelocity = 0; // 儲存角色目前的垂直速度。
let isJumping = false; // 記錄角色是否正在跳躍。
let animationFrame = 0; // 記錄目前播放的精靈影格。
let lastFrameTime = 0; // 記錄上次切換影格的時間。
let previousSprite; // 記錄上一個動作使用的精靈圖。
let idleFrameOffsets = []; // 儲存待機影格的水平置中補償值。
const characterHeight = 218; // 設定所有動作共用的角色顯示高度。
const characterWidth = 144; // 設定角色移動時保留的最大水平範圍。
const movementSpeed = 4; // 設定角色每影格的水平移動距離。
const gravity = 0.7; // 設定跳躍時的重力加速度。
const jumpStrength = 15; // 設定按下上鍵時的起跳速度。

function preload() { // 在畫面開始前載入所有角色精靈圖。
  walkSprite = loadImage("2/walk/WalkAll.png"); // 載入向右行走的 12 格精靈圖。
  backwalkSprite = loadImage("2/backwalk/BackAll.png"); // 載入向左行走的 12 格精靈圖。
  idleSprite = loadImage("2/free/free.png"); // 載入原地待機的 12 格精靈圖。
  jumpSprite = loadImage("2/jump/JumpAll.png"); // 載入跳躍用的 22 格精靈圖。
} // 結束精靈圖載入設定。

function setup() { // 初始化全螢幕畫布與角色狀態。
  createCanvas(windowWidth, windowHeight); // 建立符合瀏覽器視窗大小的畫布。
  imageMode(CENTER); // 讓精靈圖以角色中心位置繪製。
  characterX = width / 2; // 將角色放在畫面水平中央。
  characterY = height / 2; // 將角色放在畫面垂直中央。
  idleSprite.loadPixels(); // 讀取待機精靈圖的透明像素以校正每格位置。
  for (let frameIndex = 0; frameIndex < 12; frameIndex++) { // 逐格計算待機角色的可見水平中心。
    const sourceLeft = Math.floor(frameIndex * idleSprite.width / 12); // 計算目前影格的左邊界。
    const sourceRight = Math.floor((frameIndex + 1) * idleSprite.width / 12); // 計算目前影格的右邊界。
    let visibleLeft = sourceRight - sourceLeft; // 初始化角色可見範圍的左邊界。
    let visibleRight = -1; // 初始化角色可見範圍的右邊界。
    for (let sourceY = 0; sourceY < idleSprite.height; sourceY++) { // 逐列掃描目前影格的透明像素。
      for (let sourceX = sourceLeft; sourceX < sourceRight; sourceX++) { // 逐欄掃描目前影格的透明像素。
        const pixelAlphaIndex = (sourceY * idleSprite.width + sourceX) * 4 + 3; // 計算目前像素的透明度索引。
        if (idleSprite.pixels[pixelAlphaIndex] > 16) { // 忽略透明邊緣並記錄角色可見範圍。
          visibleLeft = Math.min(visibleLeft, sourceX - sourceLeft); // 更新角色可見範圍的左邊界。
          visibleRight = Math.max(visibleRight, sourceX - sourceLeft); // 更新角色可見範圍的右邊界。
        } // 結束可見像素判斷。
      } // 結束目前影格的欄位掃描。
    } // 結束目前影格的列掃描。
    idleFrameOffsets.push((visibleLeft + visibleRight + 1) / 2 - (sourceRight - sourceLeft) / 2); // 儲存影格中心的水平補償值。
  } // 結束待機影格位置計算。
  lastFrameTime = millis(); // 記錄動畫開始時間。
} // 結束初始化設定。

function draw() { // 每個畫面影格更新背景、移動與角色動畫。
  background(220); // 使用原始程式的灰色作為畫布背景。
  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵是否按住。
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵是否按住。
  const walkingRight = movingRight && !movingLeft; // 判斷角色是否只向右移動。
  const walkingLeft = movingLeft && !movingRight; // 判斷角色是否只向左移動。
  const isWalking = walkingRight || walkingLeft; // 判斷角色目前是否正在行走。

  if (walkingRight) { // 只有按住右鍵時才向右移動。
    characterX += movementSpeed; // 增加角色的水平位置。
  } // 結束向右移動判斷。
  if (walkingLeft) { // 只有按住左鍵時才向左移動。
    characterX -= movementSpeed; // 減少角色的水平位置。
  } // 結束向左移動判斷。
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2); // 限制角色不要移出畫布。

  if (isJumping) { // 角色在空中時更新跳躍物理狀態。
    characterY += verticalVelocity; // 依目前垂直速度更新角色高度。
    verticalVelocity += gravity; // 逐漸增加向下的重力速度。
    if (characterY >= height / 2) { // 角色回到畫面中央高度時結束跳躍。
      characterY = height / 2; // 將角色位置固定在畫面中央高度。
      verticalVelocity = 0; // 清除跳躍結束後的垂直速度。
      isJumping = false; // 標記角色已經落地。
      animationFrame = 0; // 重設走路動畫的起始影格。
    } // 結束落地判斷。
  } // 結束跳躍物理更新。

  const activeSprite = isJumping ? jumpSprite : walkingLeft ? backwalkSprite : isWalking ? walkSprite : idleSprite; // 依動作與方向選擇精靈圖。
  const activeFrameCount = isJumping ? 22 : 12; // 依目前精靈圖設定影格總數。
  const frameDuration = isJumping ? 35 : 80; // 設定跳躍與走路動畫的播放速度。
  if (activeSprite !== previousSprite) { // 切換動作時從新精靈圖的第一格開始。
    animationFrame = 0; // 重設目前動畫影格。
    lastFrameTime = millis(); // 重設動畫影格計時。
    previousSprite = activeSprite; // 記錄目前使用的精靈圖。
  } // 結束閒置影格處理。
  if (millis() - lastFrameTime >= frameDuration) { // 到達切換時間時更新待機、行走或跳躍動畫。
    if (isJumping) { // 跳躍動畫播放到最後一格後停住。
      animationFrame = min(animationFrame + 1, activeFrameCount - 1); // 前進一格並限制在最後影格。
    } else { // 走路動畫會持續循環播放。
      animationFrame = (animationFrame + 1) % activeFrameCount; // 前進一格並循環回到開頭。
    } // 結束動畫影格更新。
    lastFrameTime = millis(); // 記錄這次切換影格的時間。
  } // 結束動畫計時判斷。

  const frameWidth = activeSprite.width / activeFrameCount; // 依精靈圖寬度計算單格寬度。
  const displayWidth = characterHeight * frameWidth / activeSprite.height; // 依精靈圖比例計算角色顯示寬度。
  const idleCenterOffset = activeSprite === idleSprite ? idleFrameOffsets[animationFrame] * characterHeight / activeSprite.height : 0; // 計算待機影格的顯示位置補償。
  image(activeSprite, characterX - idleCenterOffset, characterY, displayWidth, characterHeight, animationFrame * frameWidth, 0, frameWidth, activeSprite.height); // 置中裁切影格並以共用高度繪製角色。
} // 結束每影格更新與繪製。

function keyPressed() { // 處理上方向鍵的跳躍操作。
  if (keyCode === UP_ARROW && !isJumping) { // 只有角色落地時才允許再次跳躍。
    isJumping = true; // 標記角色開始跳躍。
    verticalVelocity = -jumpStrength; // 設定向上的起跳速度。
    animationFrame = 0; // 從跳躍動畫的第一格開始播放。
    lastFrameTime = millis(); // 重設跳躍動畫的切換時間。
  } // 結束上方向鍵判斷。
  return false; // 阻止方向鍵觸發瀏覽器預設捲動畫面。
} // 結束鍵盤按下事件處理。

function windowResized() { // 瀏覽器視窗尺寸改變時重新調整畫布。
  resizeCanvas(windowWidth, windowHeight); // 讓畫布持續填滿瀏覽器視窗。
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2); // 調整角色水平位置以避免超出新畫布。
  characterY = height / 2; // 將角色垂直位置重新置中。
} // 結束視窗尺寸調整處理。
