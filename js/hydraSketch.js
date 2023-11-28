  window.onload = function(){
    var hydra = new Hydra({detectAudio: false})

    src(s0).mult(shape(4)).out(o1);

    osc(Math.PI * 2, 0.1, 2, 0.9, 10)
      .diff(o1, 0.4)
      .mult(shape(4, 0.2 * Math.PI * 0.5, 0.2))
      .modulateRotate(osc(2))
      .out(o2);

    noise(3)
      .modulateRotate(osc(() => mouse.x * 0.05 + 3))
      .out(o3);

    src(o0)
      .scale(() => mouse.y * 0.02 - 1.05, 2, 0.9)
      .diff(o3, 0.05)
      .add(o2, 0.6)
      .out();
  }
