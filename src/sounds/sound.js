export function Sound(id, src, volume = 1)
{
  let audioID = "AudioID_"+id;
  this.audio = document.getElementById(audioID);
  if(this.audio==null)
  {
    this.audio = document.createElement("audio");
    this.audio.id = audioID;
    this.audio.src = src;
    this.audio.volume = volume;
    this.audio.setAttribute("preload", "auto");
    this.audio.setAttribute("controls", "none");
    this.audio.style.display = "none";
    document.body.appendChild(this.audio);
  }

  this.play = function(){
    this.audio.currentTime = 0;
    this.audio.play();
  }
  this.pause = function(){
    this.audio.pause();
  }
}
