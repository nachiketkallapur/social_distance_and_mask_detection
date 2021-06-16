export const drawPerson = (detections, danger, ctx) => {
  // Loop through each prediction
  detections.forEach((prediction, i) => {

    // Extract boxes and classes
    const [x, y, width, height] = prediction['bbox'];
    const text = prediction['class'];

    // Set styling
    // const color = Math.floor(Math.random()*16777215).toString(16);
    var color;
    if (danger.has(i)) color = 'FF0000';
    else color = '00FF00';
    
    ctx.strokeStyle = '#' + color
    ctx.font = '18px Arial';

    // Draw rectangles and text
    ctx.beginPath();
    ctx.fillStyle = '#' + color
    ctx.fillText(text, x, y);
    ctx.rect(x, y, width, height);
    // ctx.arc(x+0.5*width,y+0.5*height,4,0,2*Math.PI);
    ctx.stroke();
  });
}

// Define our labelmap
const labelMap = {
  1:{name:'with_mask', color:'green'},
  2:{name:'without_mask', color:'red'},
  3:{name:'mask_weared_incorrect', color:'yellow'},
}

// Define a drawing function
export const drawMask = (boxes, classes, scores, threshold, imgWidth, imgHeight, ctx)=>{
  for(let i=0; i<=boxes.length; i++){
      if(boxes[i] && classes[i] && scores[i]>threshold){
          // Extract variables
          const [y,x,height,width] = boxes[i]
          const text = classes[i]
          
          // Set styling
          ctx.strokeStyle = labelMap[text]['color']
          ctx.lineWidth = 10
          ctx.fillStyle = labelMap[text]['color']
          ctx.font = '30px Arial'         
          
          // DRAW!!
          ctx.beginPath()
          ctx.fillText(labelMap[text]['name'] + ' - ' + Math.round(scores[i]*100)/100, x*imgWidth, y*imgHeight-10)
          ctx.rect(x*imgWidth, y*imgHeight, width*imgWidth/2, height*imgHeight/2);
          ctx.stroke()
      }
  }
}

