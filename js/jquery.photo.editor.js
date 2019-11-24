// Create Element Class
function CreateElement(tagName, className) {
  this.tagName = tagName;
  this.className = className;
  this.element = document.createElement(this.tagName);
  this.element.className = className;
  // Setting multiply attributes
  this.attr = function(attrObj) {
    for (var attrName in attrObj) {
      this.element.setAttribute(attrName, attrObj[attrName]);
    }
  }
  // Adding html elements inside this element or adding some text
  this.text = function(txt) {
    this.element.innerHTML = txt;
  }
  // Adding an event listener
  this.event = function(eventName, callBack) {
    this.element.addEventListener(eventName, callBack);
  }
  // Getting the html element
  this.getElement = function() {
    return this.element;
  }
  // Adding a class to the element
  this.addClass = function(className) {
    this.element.classList.add(className);
  }
  // Removing a class from the element
  this.removeClass = function(className) {
    this.element.classList.remove(className);
  }
}

// Create initial elements
(function() {
  var editorFragment = document.createDocumentFragment();
  var editorContainer = new CreateElement('div', 'photo-editor-container');
  var editorWrapper = new CreateElement('div', 'editor-wrapper');
  var editorCanvasContainer = new CreateElement('div', 'editor-canvas-container');
  var editorCanvasBG = new CreateElement('canvas', 'editor-canvas-bg');
  var editorCropperContainer = new CreateElement('div', 'editor-cropper-container');
  var editorCropperTopLine = new CreateElement('span', 'editor-cropper-top-line');
  var editorCropperRightLine = new CreateElement('span', 'editor-cropper-right-line');
  var editorCropperBottomLine = new CreateElement('span', 'editor-cropper-bottom-line');
  var editorCropperLeftLine = new CreateElement('span', 'editor-cropper-left-line');
  var editorCropperTopRightCorner = new CreateElement('span', 'editor-cropper-top-right-corner');
  var editorCropperTopLeftCorner = new CreateElement('span', 'editor-cropper-top-left-corner');
  var editorCropperBottomRightCorner = new CreateElement('span', 'editor-cropper-bottom-right-corner');
  var editorCropperBottomLeftCorner = new CreateElement('span', 'editor-cropper-bottom-left-corner');
  var editorCropperCenterLines = new CreateElement('span', 'editor-cropper-center-lines');
  var editorCanvasFG = new CreateElement('canvas', 'editor-canvas-fg');
  var editorTools = new CreateElement('div', 'editor-tools');
  var editorToolsBtnSave = new CreateElement('div', 'editor-tools-btn editor-btn-save');
  // var editorToolsBtnGray = new CreateElement('div', 'editor-tools-btn editor-btn-gray');
  editorContainer = editorContainer.getElement();
  editorWrapper = editorWrapper.getElement();
  editorCanvasContainer = editorCanvasContainer.getElement();
  editorCanvasBG = editorCanvasBG.getElement();
  editorCropperContainer = editorCropperContainer.getElement();
  editorCanvasFG = editorCanvasFG.getElement();
  editorTools = editorTools.getElement();
  editorToolsBtnSave = editorToolsBtnSave.getElement();
  // editorToolsBtnGray = editorToolsBtnGray.getElement();

  editorCropperContainer.appendChild(editorCropperTopLine.getElement());
  editorCropperContainer.appendChild(editorCropperRightLine.getElement());
  editorCropperContainer.appendChild(editorCropperBottomLine.getElement());
  editorCropperContainer.appendChild(editorCropperLeftLine.getElement());
  editorCropperContainer.appendChild(editorCropperTopRightCorner.getElement());
  editorCropperContainer.appendChild(editorCropperTopLeftCorner.getElement());
  editorCropperContainer.appendChild(editorCropperBottomRightCorner.getElement());
  editorCropperContainer.appendChild(editorCropperBottomLeftCorner.getElement());
  editorCropperContainer.appendChild(editorCropperCenterLines.getElement());
  editorCropperContainer.appendChild(editorCanvasFG);
  editorCanvasContainer.appendChild(editorCanvasBG);
  editorCanvasContainer.appendChild(editorCropperContainer);
  editorWrapper.appendChild(editorCanvasContainer);
  // editorTools.appendChild(editorToolsBtnGray);
  editorTools.appendChild(editorToolsBtnSave);
  editorWrapper.appendChild(editorTools);
  editorContainer.appendChild(editorWrapper);
  editorFragment.appendChild(editorContainer);
  document.body.appendChild(editorFragment);
})();

// Main function that can be called
function photoEditor() {
  var inputImg = arguments[0];
  var outputWidth = arguments[1];
  var outputHeight = arguments[2];
  var callback = arguments[3];
  var ratio = outputWidth / outputHeight;
  var orginalImgData;
  var canvasContainer = $('.editor-canvas-container');
  var canvasBG = $('.editor-canvas-bg');
  var canvasFG = $('.editor-canvas-fg');
  var cropper = $('.editor-cropper-container');
  var cropperScale = .9;
  var canvasBGPos = {
      x: 0,
      y: 0
    },
    canvasFGPos = {
      x: 0,
      y: 0
    },
    cropperPos = {
      x: 0,
      y: 0
    };

  // Convert the image file to base64
  (function(img) {
    var r = new FileReader();
    r.readAsDataURL(img);
    r.onload = function() {
      // Chacking if the file selected is an image
      var fileType = r.result.split('/')[0].split(':')[1];
      if (fileType != 'image') {
        console.error('Photo Editor Error: You must select an image file!');
        return false;
      }
      base64OnCanvas(r.result);
    }
    r.onerror = function() {
      console.error('Photo Editor Error: There is problem on converting file to base64');
      return false;
    }
  })(inputImg.get(0).files[0]);

  // Showing the base64 image on the canvas
  function base64OnCanvas(img64) {
    var ctxBG = canvasBG.get(0).getContext('2d');
    var ctxFG = canvasFG.get(0).getContext('2d');
    var image = new Image();
    image.src = img64;
    image.onload = function() {
      var w = this.width,
        h = this.height,
        cw = parseInt(canvasContainer.css('width')),
        ch = parseInt(canvasContainer.css('height')),
        cRatio = cw / ch;
      canvasBG.get(0).width = w;
      canvasBG.get(0).height = h;
      canvasFG.get(0).width = w;
      canvasFG.get(0).height = h;
      ctxBG.drawImage(this, 0, 0, this.width, this.height);
      ctxFG.drawImage(this, 0, 0, this.width, this.height);
      var cropperW = 0;
      var cropperH = 0;
      if (ratio > cRatio) {
        cropperW = cw * cropperScale;
        cropperH = cropperW / ratio;
      } else {
        cropperH = ch * cropperScale;
        cropperW = cropperH * ratio;
      }
      cropper.css({
        'width': cropperW + 'px',
        'height': cropperH + 'px',
      });

      setCanvasBGPos(cw / 2, ch / 2);
      setCropperPos(cw / 2, ch / 2);
      setCanvasFGPos();
      $('.photo-editor-container').addClass('editor-show');
    }
  }

  // Setting the background canvas position
  function setCanvasBGPos(x, y) {
    var w = canvasBG.get(0).width,
      h = canvasBG.get(0).height;
    canvasBGPos = {
      x: (x - (w / 2)),
      y: (y - (h / 2))
    };
    canvasBG.css({
      'transform': 'translate(' + canvasBGPos.x + 'px, ' + canvasBGPos.y + 'px)'
    });
  }

  // Setting the cropper position
  function setCropperPos(x, y) {
    var w = parseInt(cropper.css('width')),
      h = parseInt(cropper.css('height'));
    cropperPos = {
      x: (x - (w / 2)),
      y: (y - (h / 2))
    };
    cropper.css({
      'transform': 'translate(' + cropperPos.x + 'px, ' + cropperPos.y + 'px)',
      'background-position': -cropperPos.x + 'px ' + -cropperPos.y + 'px'
    });
  }

  // Setting the forground canvas position
  function setCanvasFGPos() {
    canvasFGPos = {
      x: canvasBGPos.x - cropperPos.x,
      y: canvasBGPos.y - cropperPos.y
    };
    canvasFG.css({
      'transform': 'translate(' + canvasFGPos.x + 'px, ' + canvasFGPos.y + 'px)'
    });
  }

  // Moving the cropper by dragging
  (function() {
    var cropperDrag = false;
    var posXinit, posYinit, thisWidthHalf, thisHeightHalf, thisX, thisY;
    cropper.mousedown(function(e) {
      if (e.target !== this) {
        return false;
      }
      cropperDrag = true;
      posXinit = e.pageX - cropper.offset().left;
      posYinit = e.pageY - cropper.offset().top;
      thisWidthHalf = parseInt(cropper.css('width')) / 2;
      thisHeightHalf = parseInt(cropper.css('height')) / 2;
      thisX = thisWidthHalf - posXinit;
      thisY = thisHeightHalf - posYinit;
    });
    $(document).mousemove(function(e) {
      if (cropperDrag) {
        var pos = {
          x: (function() {
            var containerX = e.pageX - canvasContainer.offset().left;
            var resultX = containerX + thisX;
            if (containerX - posXinit <= 0) {
              posXinit = e.pageX - cropper.offset().left;
              thisX = thisWidthHalf - posXinit;
              resultX = thisWidthHalf;
            } else if ((containerX - posXinit) + (thisWidthHalf * 2) >= parseInt(canvasContainer.css('width'))) {
              posXinit = e.pageX - cropper.offset().left;
              thisX = thisWidthHalf - posXinit;
              resultX = parseInt(canvasContainer.css('width')) - thisWidthHalf;
            }
            return resultX;
          })(),
          y: (function() {
            var containerY = e.pageY - canvasContainer.offset().top;
            var resultY = containerY + thisY;
            if (containerY - posYinit <= 0) {
              posYinit = e.pageY - cropper.offset().top;
              thisY = thisHeightHalf - posYinit;
              resultY = thisHeightHalf;
            } else if ((containerY - posYinit) + (thisHeightHalf * 2) >= parseInt(canvasContainer.css('height'))) {
              posYinit = e.pageY - cropper.offset().top;
              thisY = thisHeightHalf - posYinit;
              resultY = parseInt(canvasContainer.css('height')) - thisHeightHalf;
            }
            return resultY;
          })()
        }
        setCropperPos(pos.x, pos.y);
        setCanvasFGPos();
      }
    }).mouseup(function() {
      cropperDrag = false;
    });
  })();

  // Resizing the cropper
  (function() {
    var cropperResize = false;
    var startPos = {
      x: 0,
      y: 0
    };
    var prevHeight;
    var prevWidth;
    var resizerSelector;
    var cropperDistance;
    cropper.mousedown(function(e) {
      if (e.target !== this) {
        cropperResize = true;
        prevHeight = parseInt(cropper.css('height'));
        prevWidth = parseInt(cropper.css('width'));
        startPos = {
          x: e.pageX - cropper.offset().left,
          y: e.pageY - cropper.offset().top
        };
        cropperDistance = {
          x: cropperPos.x,
          y: cropperPos.y
        }
        resizerSelector = e.target.className.replace('editor-cropper-', '');
      }
    });
    $(document).mousemove(function(e) {
      if (cropperResize) {

        var cw = parseInt(cropper.css('width')),
          ch = parseInt(cropper.css('height'));
        var newCropperPos = {
          x: cropperPos.x + (cw / 2),
          y: cropperPos.y + (ch / 2)
        };
        var currPointerPos = {
          x: e.pageX - cropper.offset().left - startPos.x,
          y: e.pageY - cropper.offset().top - startPos.y
        };
        switch (resizerSelector) {
          case 'top-line':
            var currPointerPosY = e.pageY - canvasContainer.offset().top - cropperDistance.y - startPos.y;
            ch = prevHeight - currPointerPosY;
            cw = ch * outputWidth / outputHeight;
            newCropperPos.y = cropperDistance.y + currPointerPosY + (ch / 2);
            break;
          case 'right-line':
            cw = prevWidth + currPointerPos.x;
            newCropperPos.x = cropperPos.x + (cw / 2);
            ch = cw * outputHeight / outputWidth;
            break;
          case 'bottom-line':
            ch = prevHeight + currPointerPos.y;
            if (cropperPos.y + ch > parseInt(canvasContainer.css('height'))) {
              ch = parseInt(canvasContainer.css('height')) - cropperPos.y;
            }
            cw = ch * outputWidth / outputHeight;
            if (cropperPos.x <= 0 && cw > prevWidth) {
              resizerSelector = 'bottom-right-corner-y';
              return false;
            }
            newCropperPos.y = cropperPos.y + (ch / 2);
            break;
          case 'left-line':
            var currPointerPosX = e.pageX - canvasContainer.offset().left - cropperDistance.x - startPos.x;
            cw = prevWidth - currPointerPosX;
            newCropperPos.x = cropperDistance.x + currPointerPosX + (cw / 2);
            ch = cw * outputHeight / outputWidth;
            break;
          case 'top-right-corner':
            cw = prevWidth + currPointerPos.x;
            ch = cw * outputHeight / outputWidth;
            newCropperPos = {
              x: cropperPos.x + (cw / 2),
              y: cropperDistance.y + Math.round((prevHeight / 2) + ((prevHeight - ch) / 2))
            };
            break;
          case 'top-left-corner':
            var currPointerPosX = e.pageX - canvasContainer.offset().left - cropperDistance.x - startPos.x;
            cw = prevWidth - currPointerPosX;
            ch = cw * outputHeight / outputWidth;
            newCropperPos = {
              x: cropperDistance.x + currPointerPosX + (cw / 2),
              y: cropperDistance.y + Math.round((prevHeight / 2) + ((prevHeight - ch) / 2))
            };

            // if(newCropperPos.x - (cw / 2) <= 0) {
            //   cw += (newCropperPos.x - (cw / 2));
            //   ch = cw * outputHeight / outputWidth;
            //   newCropperPos = {
            //     x: cw / 2,
            //     y: cropperDistance.y + Math.round((prevHeight / 2) + ((prevHeight - ch) / 2))
            //   };
            // }
            // else if(newCropperPos.y - (ch / 2) <= 0) {
            //   console.log('top');
            //   console.log('y: ' + newCropperPos.y,'d: ' + (newCropperPos.y - (ch / 2)), 'h: ' + ch, 'w: ' + cw);
            //   cw += ((newCropperPos.y - (ch / 2)) * (outputWidth / outputHeight));
            //   ch = cw * outputHeight / outputWidth;
            //   newCropperPos = {
            //     x: (cropperDistance.x - cropperDistance.y * (outputWidth / outputHeight)) + (cw / 2),
            //     y: ch / 2
            //   };
            // }

            break;
          case 'bottom-right-corner':
            cw = prevWidth + currPointerPos.x;
            ch = cw * outputHeight / outputWidth;
            newCropperPos = {
              x: cropperPos.x + (cw / 2),
              y: cropperDistance.y + Math.round(ch / 2)
            };
            break;
          case 'bottom-left-corner':
            var currPointerPosX = e.pageX - canvasContainer.offset().left - cropperDistance.x - startPos.x;
            cw = prevWidth - currPointerPosX;
            ch = cw * outputHeight / outputWidth;
            newCropperPos = {
              x: cropperDistance.x + currPointerPosX + (cw / 2),
              y: cropperDistance.y + Math.round(ch / 2)
            };
            break;
        }

        cropper.css({
          'height': ch,
          'width': cw
        });
        setCropperPos(newCropperPos.x, newCropperPos.y);
        setCanvasFGPos();
      }
    }).mouseup(function() {
      cropperResize = false;
    });
  })();

  // Moving the canvases by dragging
  (function() {
    var canvasDrag = false;
    var posXinit, posYinit;
    canvasContainer.mousedown(function(e) {
      if (e.target !== this) {
        return false;
      }
      canvasDrag = true;
      canvasContainer.addClass('canvas-dragging');
      posXinit = e.pageX - canvasBGPos.x - (parseInt(canvasBG.css('width')) / 2);
      posYinit = e.pageY - canvasBGPos.y - (parseInt(canvasBG.css('height')) / 2);
    });
    $(document).mousemove(function(e) {
      if (canvasDrag) {
        var pos = {
          x: (function() {
            var containerX = e.pageX - posXinit;
            var resultX = containerX;
            return resultX;
          })(),
          y: (function() {
            var containerY = e.pageY - posYinit;
            var resultY = containerY;
            return resultY;
          })()
        }
        setCanvasBGPos(pos.x, pos.y);
        setCanvasFGPos();
      }
    }).mouseup(function() {
      canvasDrag = false;
      canvasContainer.removeClass('canvas-dragging');
    });
  })();

  // Enable moving the canvases by holding the space key when the mouse pointer is on the cropper
  (function() {
    $(document).keydown(function(e) {
      if (e.keyCode == 32) {
        cropper.addClass('canvas-dragging-by-space-key');
      }
    }).keyup(function(e) {
      if (e.keyCode == 32) {
        cropper.removeClass('canvas-dragging-by-space-key');
      }
    });
  })();

  // Grayscale effect
  // function grayscale() {
  //   var canvas = $('.editor-canvas').get(0);
  //   var ctx = canvas.getContext('2d');
  //   var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  //   orginalImgData = imgData;
  //   for (var i = 0; i < imgData.data.length; i += 4) {
  //     var gray = (imgData.data[i + 0] + imgData.data[i + 1] + imgData.data[i + 2] + imgData.data[i + 3]) / 4;
  //     imgData.data[i + 0] = gray;
  //     imgData.data[i + 1] = gray;
  //     imgData.data[i + 2] = gray;
  //     imgData.data[i + 3] = gray;
  //   }
  //   ctx.putImageData(imgData, 0, 0);
  // }

  // Closing the editor
  function closeEditor() {
    var rx = cropperPos.x - canvasBGPos.x;
    var ry = cropperPos.y - canvasBGPos.y;
    var cropperW = parseInt(cropper.css('width'));
    var cropperH = parseInt(cropper.css('height'));
    // var BGctx = canvasBG.get(0).getContext('2d');
    console.log('rx: ' + rx, 'ry: ' + ry, 'rx + cropperW: ' + (rx + cropperW), 'ry + cropperH: ' + (ry + cropperH));
    // var canvasData = BGctx.getImageData(rx, ry, rx + cropperW, ry + cropperH);
    var resultCanvas = new CreateElement('canvas', 'output-result-canvas');
    resultCanvas = resultCanvas.getElement();
    resultCanvas.width = outputWidth;
    resultCanvas.height = outputHeight;
    var resultCtx = resultCanvas.getContext('2d');
    resultCtx.drawImage(canvasBG.get(0), rx, ry, cropperW, cropperH, 0, 0, outputWidth, outputHeight);
    $('body').append(resultCanvas);
    var resultImg = resultCanvas.toDataURL("image/png");
    $('.photo-editor-container.editor-show').removeClass('editor-show');
    // (function(canvas) {
    //   var ctx = canvas.getContext('2d');
    //   ctx.clearRect(0, 0, canvas.width, canvas.height);
    // })($('.editor-canvas').get(0));
    // $('.editor-canvas').removeAttr('width');
    // $('.editor-canvas').removeAttr('height');
    // $('.editor-canvas-wrapper').removeAttr('style');
    $('.editor-wrapper .editor-tools').off('click');
    if (typeof callback == 'function') {
      callback(resultImg);
    }
  }

  $('.editor-wrapper .editor-tools').on('click', '.editor-btn-save', function() {
    closeEditor();
  });
  // $('.editor-wrapper .editor-tools').on('click', '.editor-btn-gray', function() {
  //   grayscale();
  // });
}
