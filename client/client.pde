JSONArray faces;
int s;
int lastSecond;
void setup() {
  size(1920, 1080);
}

void draw() {

  s = second() * 5;

  //if the second was updated then do something once
  if (s != lastSecond)
  {
      faces = loadJSONArray("http://localhost/api");
      background(255);
      for (int f = 0; f < faces.size(); f++) {
        try {
        JSONArray face = faces.getJSONArray(f);
        for(int i = 0; i < face.size(); i++){
          JSONObject draw = face.getJSONObject(i); 
          int type = draw.getInt("type");
          int w = draw.getInt("w");
          int h = draw.getInt("h");
          JSONArray pos = draw.getJSONArray("pos");
          JSONArray fill = draw.getJSONArray("drawFill");
  
        switch(type) {
        case 0:
          fill(fill.getInt(0), fill.getInt(1), fill.getInt(2));
          stroke(fill.getInt(0), fill.getInt(1), fill.getInt(2));
          ellipse(pos.getInt(0), pos.getInt(1), w, h);
          break;
          }
        }
        }catch (Exception e) {
          
        }
      }
    
    lastSecond = s;
  }
}
