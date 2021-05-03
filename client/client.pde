import codeanticode.syphon.*;
PGraphics[] canvas;
int faceCount = 8;
JSONArray faces;
SyphonServer[] servers;
int s;
int lastSecond;
void setup() {
  size(1, 1, P2D);
  canvas = new PGraphics[faceCount];
  servers = new SyphonServer[faceCount];
  for (int i = 0; i < faceCount; i++) {
    canvas[i] = createGraphics(1920, 1080, P2D);
    servers[i] = new SyphonServer(this, "Face "+i);
  }
}

void draw() {

  s = second() * 5;

  //if the second was updated then do something once
  if (s != lastSecond)
  {
    try {
      //faces = loadJSONArray("https://drawmapper.herokuapp.com/api");
      faces = loadJSONArray("http://localhost/api");
      for (int f = 0; f < faces.size(); f++) {
        canvas[f].beginDraw();
        try {
          JSONArray face = faces.getJSONArray(f);
          canvas[f].background(0);
          canvas[f].fill(0);
          canvas[f].stroke(255, 255, 255);
          canvas[f].triangle(960, 55, 1435, 845, 485, 845);
          for (int i = 0; i < face.size(); i++) {
            JSONObject draw = face.getJSONObject(i); 
            int type = draw.getInt("type");
            int w = draw.getInt("w");
            int h = draw.getInt("h");
            JSONArray pos = draw.getJSONArray("pos");
            JSONArray fill = draw.getJSONArray("drawFill");
            canvas[f].fill(fill.getInt(0), fill.getInt(1), fill.getInt(2));
            canvas[f].stroke(fill.getInt(0), fill.getInt(1), fill.getInt(2));
            switch(type) {
            case 0:
              canvas[f].ellipse(pos.getInt(0), pos.getInt(1), w, h);
              break;
            case 1:
              canvas[f].rect(pos.getInt(0), pos.getInt(1), w, w);
              break;
            case 2:
              star(canvas[f], pos.getInt(0), pos.getInt(1), w * (3 / 7), w, 5);
              break;
            case 3:
              polygon(canvas[f], pos.getInt(0), pos.getInt(1), w, 5);
              break;
            case 4:
              println("Render Text " + draw.getString("textData"));
              canvas[f].textAlign(CENTER);
              canvas[f].textSize(w);
              canvas[f].text(draw.getString("textData"), pos.getInt(0), pos.getInt(1));
              break;
            }
          }
        }
        catch (Exception e) {
        }
        canvas[f].endDraw();
        servers[f].sendImage(canvas[f]);
      }
    }
    catch(Exception e) {
    }
    lastSecond = s;
  }
}

void star(PGraphics canvas, float x, float y, float radius1, float radius2, int npoints) {
  float angle = TWO_PI / npoints;
  float halfAngle = angle / 2.0;
  canvas.beginShape();
  for (int a = 0; a < TWO_PI; a += angle) {
    float sx = x + cos(a) * radius2;
    float sy = y + sin(a) * radius2;
    canvas.vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    canvas.vertex(sx, sy);
  }
  canvas.endShape(CLOSE);
}

void polygon(PGraphics canvas, float x, float y, float radius, int npoints) {
  float angle = TWO_PI / npoints;
  canvas.beginShape();
  for (int a = 0; a < TWO_PI; a += angle) {
    float sx = x + cos(a) * radius;
    float sy = y + sin(a) * radius;
    canvas.vertex(sx, sy);
  }
  canvas.endShape(CLOSE);
}  
