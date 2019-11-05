$("#addBTN").click(function(event)
{
   var fileInput = document.getElementById('file-input');
   var fileList = []; //this is where all user inputted files will be saved to first

   for(var i = 0; i < fileList.length; i++)
   {
      if(checkExtension(fileList[i]) && checkDuplicate(file))
      {
         // assert not duplicate and right file type before saving user uploaded file to the folder
         sendFile(file);
         updateInputFileDiv();
      }
   }

   function sendFile(file)
   {
      var formData = new FormData();
      fd = new FormData();
      clipName = Date.now().toString();
      fd.append('file', file, clipName + '.wav');

        console.log('POSTing data...');

        let xhr = new XMLHttpRequest();
        xhr.onload = function (e) {
            if(this.readyState === 4){
                console.log('success');
                let video = document.getElementById('canvas_video');
                  let url = window.URL || window.webkitURL;
                  video.src = url.createObjectURL(xhr.response);
            }

        };

        '../upload'
        xhr.open('POST', "../example", true);
        xhr.send(fd);
        xhr.responseType = 'blob';
      var request = new XMLHttpRequest();

      formData.set('file', file);
      request.open("POST", "../../User\ Uploads");
      request.send(formData);
   }
});

function checkDuplicate(file)
{
   // checks user input folder, returns true if file being added DNE in the folder
   // returns false is file is already in folder --> won't get uploaded twice

   //stub code, will be implemented later
   return true;

}

function checkExtension(file)
{
   // checks the extension of the file being uploaded
   // returns true if valid file type, returns false otherwise

   var validFileExtensions = [".wav", ".midi", ".mid", ".mp3"];
   var isValid = false;
   if(file.type == "file")
   {
      var fileName = file.value;
      if(fileName.length > 0)
      {
         for(var i = 0; i < validFileExtensions.length; i++)
         {
            if(fileName.substr(fileName.length - validFileExtensions[i].length, validFileExtensions[i].length).toLowerCase() == validFileExtensions[i].toLowerCase()) //this line is straight from StackOverflow, needs testing
            {
               isValid = true;
               break;
            }
         }
      }
      if(!isValid)
      {
         alert("Sorry, "+fileName+" is not a supported file type! Valid file types are .wav, .midi, .mid, and .mp3");
         file.value = ""; //nullify the
         return false;
      }
      return isValid;
   }
}

function updateInputFileDiv()
{
   // reads files in User Uploads, for each file in that folder it creates
   // a new p tag with the file name in it and add it to the user inputs column
}

$("#downloadBTN").click(function(event)
{
   // Targets user's downloads folder and downloads file(s) to that dir
   // NEEDS TO BE IMPLEMENTED
});
