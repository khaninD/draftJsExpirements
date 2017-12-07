const loadImageAsync = (url) => {
  if (Array.isArray(url)) {
    return url.map((src, index) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onerror = function(err) {
          reject(new Error("Network Error"));
        };
        img.onload = function(...arg) {
          resolve(arg)
        }
      });
    })
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onerror = function(err) {
      reject(new Error("Network Error"));
    };
    img.onload = function(...arg) {
      resolve(arg)
    }
  });
};

const setScript = (url) => {
  const script = document.createElement('script');
  script.src = url;
  script.async = false;
  document.body.appendChild(script);
};

module.exports = {
  loadImageAsync,
  setScript
};