$("#addBTN").change(function(event)
{
   var fileInput = document.getElementById('file-input');
   var fileList = []; //this is where all user inputted files will be saved to first

   function sendFile(file)
   {
      var formData = new FormData();
      var request = new XMLHttpRequest();

      formData.set('file', file);
      request.open("POST", file_directory_here);
      request.send(formData);
   }
});

function checkDuplicate(file)
{
   // checks user input folder, returns true if file being added DNE in the folder
   // returns false is file is already in folder --> won't get uploaded twice

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
            if(fileName.substr(fileName.length - validFileExtensions[i].length, validFileExtensions[i].length).toLowerCase() == validFileExtensions[i].toLowerCase())
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

$("#downloadBTN").click(function(event)
{

});
