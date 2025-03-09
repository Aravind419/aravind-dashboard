
// This file contains the code for the web worker that handles timer functionality
// even when the browser tab is inactive or minimized

/**
 * Creates a string representation of a timer worker
 * This is used to create a Blob URL for the worker
 */
export const createTimerWorkerCode = (): string => {
  return `
    let intervalId = null;
    let startTime = null;
    let lastTick = null;
    let isPomodoro = false;
    let totalTime = 0;
    
    self.onmessage = function(e) {
      if (e.data.action === 'start') {
        startTime = e.data.startTime || Date.now();
        lastTick = Date.now();
        isPomodoro = e.data.isPomodoro;
        totalTime = e.data.totalTime || 0;
        
        clearInterval(intervalId);
        intervalId = setInterval(() => {
          const now = Date.now();
          const elapsed = now - lastTick;
          lastTick = now;
          
          if (isPomodoro) {
            totalTime = Math.max(0, totalTime - Math.floor(elapsed / 1000));
            self.postMessage({ time: totalTime, type: 'tick' });
            
            if (totalTime <= 0) {
              clearInterval(intervalId);
              self.postMessage({ type: 'completed' });
            }
          } else {
            const totalElapsed = Math.floor((now - startTime) / 1000);
            self.postMessage({ time: totalElapsed, type: 'tick' });
          }
        }, 1000);
      } else if (e.data.action === 'stop') {
        clearInterval(intervalId);
      } else if (e.data.action === 'sync') {
        if (isPomodoro) {
          totalTime = e.data.time;
        } else {
          startTime = Date.now() - (e.data.time * 1000);
        }
      }
    };
  `;
};

/**
 * Creates a web worker that runs the timer in the background
 */
export const createTimerWorker = (): Worker => {
  const workerCode = createTimerWorkerCode();
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};
