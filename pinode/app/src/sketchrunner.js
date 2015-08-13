var exec = require('child_process').exec;

/**********************************************
 * Sketch-Runner
 **********************************************/

module.exports = {

  sketchdata: [{}],
  sketchidx: 0,
  is_running: false,
  next_timeout: false,
  config: {},

  dmxstep: 0,
  dmxnum: 0,
  dmxsleep: 0,
  dmxtimeout: false,
  dmxblocking: false,
  dmxchannel: false,


  stop: function(){
    this.is_running = false;
    this.sketchdata = [{}];
    clearTimeout(this.next_timeout);
  },


  spawn_exec: function( command, callback ){
    var child = exec( command );
    child.stdout.on('data', function(data) {
        console.log( data );
    });
    child.stderr.on('data', function(data) {
        console.log( data );
    });
    child.on('close', function(code) {
        callback( code );
    });
  },


  start: function( data ){
    that=this
    this.sketchdata = data;
    this.sketchidx = 0;
    is_running = true;
    this.processitem( this.next() );
  },


  next: function(){
    var item = this.sketchdata[this.sketchidx];
    if (item){
      this.sketchidx++;
      return item;
    }
    else {
      this.is_running = false;
      return false;
    }
  },


  sleepnext: function( delay ){
    this.next_timeout = setTimeout( that.aftersleep, delay );
  },


  aftersleep: function(){
    var nextitem=that.next();
    if (nextitem){
      that.processitem(nextitem);
    }
  },


  dmxrunner: function(){
    console.log("set dmx to:" + that.dmxnum );
    artnet.set(0, parseInt( that.dmxchannel ), parseInt( that.dmxnum ));
    if ((that.dmxstep-1) < that.dmxnum ) {
      console.log("dmx done");
      if ( that.dmxblocking ) {
        that.dmxblocking = false;
        var nextitem=that.next();
        if (nextitem){
          that.processitem(nextitem);
        }
      }
      return;
    }
    that.dmxtimeout = setTimeout( that.dmxrunner, that.dmxsleep );
    that.dmxnum++;
  },


  processitem: function( item ){

    switch ( item.type ) {

      case "lifx":
        console.log("run lifx");
        // all lamps in config
        if ( !item.bulb ){
          for ( bulb of this.config.lifxbulbs ){
            if ( bulb.id ){
              lx.lightsColour( item.h, item.s, item.l, item.w, item.t, bulb.id );
            }
          }
        }
        // single lamp
        else {
          lx.lightsColour( item.h, item.s, item.l, item.w, item.t, item.bulb );
        }
        if ( item.blocking ){
          console.log("lifx blocking");
          this.sleepnext(item.t);
          return;
        }
        break;

      case "dmx":
        console.log("run dmx");
        this.dmxchannel = item.channel;
        this.dmxstep = item.end-item.start;
        this.dmxnum = 0;
        this.dmxsleep = item.duration / this.dmxstep ;
        this.dmxrunner();

        if ( item.blocking ){
          console.log("dmx blocking");
          this.dmxblocking = true;
          return;
        }
        else {
          this.dmxblocking = false;
        }
        break;

      case "audio":
        console.log(item)
        console.log("run audio");
        break;

      case "video":
        console.log("run video");
        break;

      case "delay":
        console.log("delay");
        this.sleepnext(item.duration);
        return;
        break;

      case "script":
        console.log("run script");
        if ( item.blocking ){
          console.log("script blocking");
          this.spawn_exec(item.cmd, this.aftersleep );
          return;
        }
        else {
          this.spawn_exec(item.cmd, this.aftersleep );
        }
        break;

      default:
        break;

    }

    var nextitem=this.next();
    if (nextitem){
      this.processitem(nextitem);
    }

  }

}
