import codeanticode.syphon.*;
PGraphics[] canvas;
int faceCount = 8;
JSONArray faces;
SyphonServer[] servers;
int s;
int lastSecond;
void setup() {
  size(1,1, P2D);
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

            switch(type) {
            case 0:
              canvas[f].fill(fill.getInt(0), fill.getInt(1), fill.getInt(2));
              canvas[f].stroke(fill.getInt(0), fill.getInt(1), fill.getInt(2));
              canvas[f].ellipse(pos.getInt(0), pos.getInt(1), w, h);
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
