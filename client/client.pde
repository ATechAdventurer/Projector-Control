JSONArray draws;
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
    background(255);
    draws = loadJSONArray("http://localhost/api");
    try {
      for (int i = 0; i < draws.size(); i++) {
        JSONObject draw = draws.getJSONObject(i); 
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
    }
    catch(Exception e) {
    }
    lastSecond = s;
  }
}
