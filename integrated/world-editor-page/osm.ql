[out:json];
(
way["highway"]
  ["highway" !~ "pedestrian"]
  ["highway" !~ "footway"]
  ["highway" !~ "cycleway"]
  ["highway" !~ "path"]
  ["highway" !~ "service"]
  ["highway" !~ "corridor"]
  ["highway" !~ "track"]
  ["highway" !~ "steps"]
  ["highway" !~ "raceway"]
  ["highway" !~ "bridleway"]
  ["highway" !~ "proposed"]
  ["highway" !~ "construction"]
  ["highway" !~ "elevator"]
  ["highway" !~ "bus_guideway"]
  ["access" !~ "private"]
  ["access" !~ "no"]
({{bbox}});
  );
out body;
>;
out skel;


