const form   = document.querySelector("form"),
fileInput    = document.querySelector(".file-input"),
progressArea = document.querySelector(".progress-area"),
uploadedArea = document.querySelector(".uploaded-area");

// form click event
form.addEventListener("click", () =>{
  fileInput.click();
});

fileInput.onchange = ({target})=> {
  let file = target.files[0]; //getting file [0] this means if user has selected multiple files then get first one only
  if(file){
    let fileName = file.name; //getting file name
    if(fileName.length >= 12) { //if file name length is greater than 12 then split it and add ...
      let splitName = fileName.split('.');
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    
    uploadFileInput(file, './uploads/files', 'pdf|doc|docx|mp3|mp4|rar', 0); //calling uploadFile with passing file name as an argument
  }
}

// file upload function
function uploadFileInput(file, destination, ext, start) {
  
  let bytes_per_chunk = 1024 * 1024 * 1;  // upload per unit = 1 MB
  let size = file.size;
  let end = (start+bytes_per_chunk)>=size?size:(start+bytes_per_chunk);
  let data = new FormData();
  data.append('ax_file_input', file.slice(start, end));
  data.append('ax-file-path', destination);
  data.append('ax-allow-ext', ext);
  data.append('ax-file-name', file.name);
  data.append('ax-max-file-size', '10G');
  data.append('ax-start-byte', end);
  data.append('ax-last-chunk', end==size);

  let xhr = new XMLHttpRequest(); //creating new xhr object (AJAX)
  xhr.open("POST", "./php/upload.php"); //sending post request to the specified URL
  xhr.responseType = 'json';
  xhr.send(data); //sending form data
  
  xhr.onreadystatechange = function() {
    
    if (xhr.readyState === 4) {
      let data = xhr.response; 
      let name = data.name;
      let fileLoaded = Math.floor((end / size) * 100);  //getting percentage of loaded file size
      let fileTotal = Math.floor(size / 1024); //gettting total file size in KB from bytes
      let fileSize;
      // if file size is less than 1024 then add only KB else convert this KB into MB
      (fileTotal < 1024) ? fileSize = fileTotal + " KB" :  ( (fileTotal< (1024*1024)) ?  fileSize = (end / (1024*1024)).toFixed(2) + " MB" : fileSize = (end / (1024*1024*1024)).toFixed(2) + " GB");
      
      let progressHTML = `<li class="row">
                          <i class="fas fa-file-alt"></i>
                          <div class="content">
                            <div class="details">
                              <span class="name">${name} • Uploading</span>
                              <span class="percent">${fileLoaded}%</span>
                            </div>
                            <div class="progress-bar">
                              <div class="progress" style="width: ${fileLoaded}%"></div>
                            </div>
                          </div>
                        </li>`;
        
      uploadedArea.classList.add("onprogress");
      progressArea.innerHTML = progressHTML;
        
      if(end == size) {
        progressArea.innerHTML = "";
        let uploadedHTML = `<li class="row">
                                <div class="content upload">
                                  <i class="fas fa-file-alt"></i>
                                  <div class="details">
                                    <span class="name">${name} • Uploaded</span>
                                    <span class="size">${fileSize}</span>
                                  </div>
                                </div>
                                <i class="fas fa-check"></i>
                              </li>`;

        uploadedArea.classList.remove("onprogress");
        uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML); //remove this line if you don't want to show upload history

      } else {
        uploadFileInput(file, destination, ext, end);
      }  
    }
  }

  
}