
var AMOUNT_DIAMONDS = 30;
var AMOUNT_BOOBLES = 15;

GamePlayManager = {
    init: function() {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        
        this.flagFirstMouseDown = false;
        this.amountDiamondsCaught = 0;
        this.endGame = false;
        
        this.countSmile = -1;
    },
    preload: function() {
        game.load.image('background', 'assets/images/fondo.jpg');
        game.load.spritesheet('nico', 'assets/images/nicos.png', 179, 330, 2);
        game.load.spritesheet('diamonds', 'assets/images/diamonds.png', 81, 84, 3);
        
        game.load.image('explosion', 'assets/images/explosion.png');
        
        game.load.image('unicornio', 'assets/images/unicornio.png');
        game.load.image('cerdito', 'assets/images/cerdo.png');
        // game.load.image('mollusk', 'assets/images/mollusk.png');
        
        game.load.image('booble1', 'assets/images/taza-de-cafe.png');
        game.load.image('booble2', 'assets/images/granos-de-cafe.png');
    },
    create: function() {
        game.add.sprite(0, 0, 'background');
        
        this.boobleArray = [];
        for(var i=0; i<AMOUNT_BOOBLES; i++){
            var xBooble = game.rnd.integerInRange(1, 1498);
            var yBooble = game.rnd.integerInRange(600, 1000);
            
            var booble = game.add.sprite(xBooble, yBooble, 'booble' + game.rnd.integerInRange(1,2));
            booble.vel = 0.2 + game.rnd.frac() * 2;
            booble.alpha = 0.9;
            booble.scale.setTo( 0.2 + game.rnd.frac() );
            this.boobleArray[i] = booble;
        }
        this.unicornio = game.add.sprite(500,200,'unicornio');
        this.unicornio2 = game.add.sprite(900,450,'unicornio');
        this.unicornio.scale.setTo(-1,1);
        this.cerdito = game.add.sprite(400, 750, 'cerdito')
        this.cerdito.scale.setTo(-1.5,1.5);
       
        
        this.nico = game.add.sprite(0,0,'nico');
        this.nico.frame = 0;
        this.nico.x = game.width/2;
        this.nico.y = game.height/2;
        this.nico.anchor.setTo(0.5);
        
        game.input.onDown.add(this.onTap, this);
        
        this.diamonds = [];
        for(var i=0; i<AMOUNT_DIAMONDS; i++){
            var diamond = game.add.sprite(100,100,'diamonds');
            diamond.frame = game.rnd.integerInRange(0,2);
            diamond.scale.setTo( 0.50 + game.rnd.frac());
            diamond.anchor.setTo(0.5);
            diamond.x = game.rnd.integerInRange(50, 1450);
            diamond.y = game.rnd.integerInRange(50, 880);
            
            this.diamonds[i] = diamond;
            var rectCurrenDiamond = this.getBoundsDiamond(diamond);
            var rectnico = this.getBoundsDiamond(this.nico);
            
            while(this.isOverlapingOtherDiamond(i, rectCurrenDiamond) || this.isRectanglesOverlapping(rectnico, rectCurrenDiamond) ){
                diamond.x = game.rnd.integerInRange(50, 1050);
                diamond.y = game.rnd.integerInRange(50, 600);
                rectCurrenDiamond = this.getBoundsDiamond(diamond);
            }
        }
        
        this.explosionGroup = game.add.group();
       
        for(var i=0; i<10; i++){
            this.explosion = this.explosionGroup.create(100,100,'explosion');
            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                            x: [0.4, 0.8, 0.4],
                            y: [0.4, 0.8, 0.4]
                }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                            alpha: [1, 0.6, 0]
                }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.anchor.setTo(0.5);
            this.explosion.kill();
        }
        
        this.currentScore = 0;
        var style = {
            font: 'bold 30pt Arial',
            fill: '#FFFFFF',
            align: 'center'
          }
        
        this.scoreText = game.add.text(game.width/2, 40, '0', style);
        this.scoreText.anchor.setTo(0.5);
        
        this.totalTime = 24;
        this.timerText = game.add.text(1400, 40, this.totalTime+'', style);
        this.timerText.anchor.setTo(0.5);
        
        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
            if(this.flagFirstMouseDown){
                this.totalTime--;
                this.timerText.text = this.totalTime+'';
                if(this.totalTime<=0){
                    game.time.events.remove(this.timerGameOver);
                    this.endGame = true;
                    this.showFinalMessage('GAME OVER');
                }
            }
        },this);
        
        
    },
    increaseScore:function(){
        this.countSmile = 0;
        this.nico.frame = 1;
        
        this.currentScore+=100;
        this.scoreText.text = this.currentScore;
        
        this.amountDiamondsCaught += 1;
        if(this.amountDiamondsCaught >= AMOUNT_DIAMONDS){
            game.time.events.remove(this.timerGameOver);
            this.endGame = true;
            this.showFinalMessage('¡¡¡FELICIDADES!!!');
        }
    },
    showFinalMessage:function(msg){
        // this.tweenMollusk.stop();
        
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = '#000000';
        bgAlpha.ctx.fillRect(0,0,game.width, game.height);
        
        var bg = game.add.sprite(0,0,bgAlpha);
        bg.alpha = 0.5;
        
        var style = {
            font: 'bold 60pt Arial',
            fill: '#FFFFFF',
            align: 'center'
          }
        
        this.textFieldFinalMsg = game.add.text(game.width/2, game.height/2, msg, style);
        this.textFieldFinalMsg.anchor.setTo(0.5);
    },
    onTap:function(){
        // if(!this.flagFirstMouseDown){
        //     this.tweenMollusk = game.add.tween(this.mollusk.position).to( {y: -0.001}, 5800, Phaser.Easing.Cubic.InOut, true, 0, 1000, true).loop(true);
        // }
        this.flagFirstMouseDown = true;
    },
    getBoundsDiamond:function(currentDiamond){
        return new Phaser.Rectangle(currentDiamond.left, currentDiamond.top, currentDiamond.width, currentDiamond.height);
    },
    isRectanglesOverlapping: function(rect1, rect2) {
        if(rect1.x> rect2.x+rect2.width || rect2.x> rect1.x+rect1.width){
            return false;
        }
        if(rect1.y> rect2.y+rect2.height || rect2.y> rect1.y+rect1.height){
            return false;
        }
        return true;
    },
    isOverlapingOtherDiamond:function(index, rect2){
        for(var i=0; i<index; i++){
            var rect1 = this.getBoundsDiamond(this.diamonds[i]);
            if(this.isRectanglesOverlapping(rect1, rect2)){
                return true;
            }
        }
        return false;
    },
    getBoundsnico:function(){
        var x0 = this.nico.x - Math.abs(this.nico.width)/4;
        var width = Math.abs(this.nico.width)/2;
        var y0 = this.nico.y - this.nico.height/2;
        var height = this.nico.height;
        
        return new Phaser.Rectangle(x0, y0,width,height);
    },
    render:function(){
        //game.debug.spriteBounds(this.nico);
        for(var i=0; i<AMOUNT_DIAMONDS; i++){
            //game.debug.spriteBounds(this.diamonds[i]);
        }
    },
    update: function() {
        if(this.flagFirstMouseDown && !this.endGame){
            
            for(var i=0; i<AMOUNT_BOOBLES; i++){
                var booble = this.boobleArray[i];
                booble.y -= booble.vel;
                if(booble.y < -50){
                    booble.y = 700;
                    booble.x = game.rnd.integerInRange(1,1140);
                }
            }
            
            if(this.countSmile>=0){
                this.countSmile++;
                if(this.countSmile>25){
                    this.countSmile = -1;
                    this.nico.frame = 0;
                }
            }
            
            this.unicornio.x = this.unicornio.x - 1.5;
            if(this.unicornio.x<-100){
                this.unicornio.x = 1520;
            }

            this.unicornio2.x = this.unicornio2.x + 1;
            if(this.unicornio2.x>1500){
                this.unicornio2.x = -20;
            }
            
            this.cerdito.x+=3;
            if(this.cerdito.x>1600){
                this.cerdito.x = -200;
            }
            var pointerX = game.input.x;
            var pointerY = game.input.y;

            var distX = pointerX - this.nico.x;
            var distY = pointerY - this.nico.y;

            if(distX>0){
                this.nico.scale.setTo(1,1);
            }else{
                this.nico.scale.setTo(-1,1);
            }

            this.nico.x += distX * 0.02;
            this.nico.y += distY * 0.02;
            
            for(var i=0; i<AMOUNT_DIAMONDS; i++){
                var rectnico = this.getBoundsnico();
                var rectDiamond = this.getBoundsDiamond(this.diamonds[i]);
                
                
                if(this.diamonds[i].visible && this.isRectanglesOverlapping(rectnico, rectDiamond)){
                    this.increaseScore();
                    
                    this.diamonds[i].visible = false;
                    
                    var explosion = this.explosionGroup.getFirstDead();
                    if(explosion!=null){
                        explosion.reset(this.diamonds[i].x, this.diamonds[i].y);
                        explosion.tweenScale.start();
                        explosion.tweenAlpha.start();
                        
                        explosion.tweenAlpha.onComplete.add(function (currentTarget, currentTween) {
                            currentTarget.kill();
                        }, this);
                    }
                    
                }
            }
        }
        
    }
}

var game = new Phaser.Game(1500, 938, Phaser.CANVAS);
    
game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");