// Generated by CoffeeScript 1.6.3
(function() {
  Crafty.c("TiledLevel", {
    makeTiles: function(ts, drawType) {
      var buildProperties, firstgid, genericProperties, i, nComp, posx, posy, sMap, sName, tHeight, tName, tNum, tWidth, tsHeight, tsImage, tsProperties, tsWidth, xCount, yCount, _i, _ref;
      tsImage = ts.image, firstgid = ts.firstgid, tsWidth = ts.imagewidth;
      tsHeight = ts.imageheight, tWidth = ts.tilewidth, tHeight = ts.tileheight;
      tsProperties = ts.tileproperties, genericProperties = ts.properties;
      this.tileHeights = {};
      tNum = firstgid;
      xCount = tsWidth / tWidth | 0;
      yCount = tsHeight / tHeight | 0;
      sMap = {};
      for (i = _i = 0, _ref = yCount * xCount; _i < _ref; i = _i += 1) {
        this.tileHeights[tNum] = tHeight;
        posx = i % xCount;
        posy = i / xCount | 0;
        sName = "tileSprite" + tNum;
        tName = "tile" + tNum;
        sMap[sName] = [posx, posy];
        nComp = {
          comp: "2D, " + drawType + ", " + sName + ", MapTile",
          prop: {},
          init: function() {
            this.addComponent(this.comp);
            return this.attr(this.prop);
          }
        };
        buildProperties = function(props) {
          var name, value;
          if (props != null) {
            for (name in props) {
              value = props[name];
              if (name === "components") {
                nComp.comp += ", " + value;
              } else {
                nComp.prop[name] = value;
              }
            }
          }
          return null;
        };
        buildProperties(genericProperties);
        if (tsProperties) {
          buildProperties(tsProperties[tNum - firstgid]);
        }
        Crafty.c(tName, nComp);
        tNum++;
      }
      Crafty.sprite(tWidth, tHeight, tsImage, sMap);
      return null;
    },
    makeLayer: function(layer) {
      var layerDetails;
      layerDetails = (function() {
        switch (layer.type) {
          case "tilelayer":
            return this.makeTileLayer(layer);
          case "objectgroup":
            return this.makeObjectLayer(layer);
          default:
            return [];
        }
      }).call(this);
      this._layerArray.push(layerDetails);
      return null;
    },
    makeObjectLayer: function(layer) {
      var components, e, gid, h, layerDetails, name, obj, props, value, w, x, y, _i, _len, _ref;
      console.log(this.tileHeights);
      layerDetails = [];
      _ref = layer.objects;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        gid = obj.gid, w = obj.width, h = obj.height, x = obj.x, y = obj.y, props = obj.properties;
        components = gid ? "tile" + gid : "MapObject, 2D";
        if (props && props.components) {
          components += ", " + props.components;
        }
        console.log(gid);
        e = Crafty.e(components);
        e.x = x;
        e.y = y;
        if (gid) {
          e.y -= this.tileHeights[gid];
        }
        if (h > 0) {
          e.h = h;
        }
        if (w > 0) {
          e.w = w;
        }
        for (name in props) {
          value = props[name];
          if (name !== "components") {
            e[name] = value;
          }
        }
      }
      return layerDetails;
    },
    makeTileLayer: function(layer) {
      var i, lData, lHeight, lWidth, layerDetails, tDatum, tile, _i, _len;
      lData = layer.data, lWidth = layer.width, lHeight = layer.height;
      layerDetails = {
        tiles: [],
        width: lWidth,
        height: lHeight
      };
      for (i = _i = 0, _len = lData.length; _i < _len; i = ++_i) {
        tDatum = lData[i];
        if (tDatum) {
          tile = Crafty.e("tile" + tDatum);
          tile.x = (i % lWidth) * tile.w;
          tile.y = (i / lWidth | 0) * tile.h;
          layerDetails.tiles[i] = tile;
        }
      }
      return layerDetails;
    },
    tiledLevel: function(levelURL, drawType) {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: levelURL,
        dataType: 'json',
        data: {},
        async: false,
        success: function(level) {
          var lLayers, ts, tsImages, tss;
          lLayers = level.layers, tss = level.tilesets;
          drawType = drawType != null ? drawType : "Canvas";
          tsImages = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = tss.length; _i < _len; _i++) {
              ts = tss[_i];
              _results.push(ts.image);
            }
            return _results;
          })();
          Crafty.load(tsImages, function() {
            var layer, _i, _j, _len, _len1;
            for (_i = 0, _len = tss.length; _i < _len; _i++) {
              ts = tss[_i];
              _this.makeTiles(ts, drawType);
            }
            for (_j = 0, _len1 = lLayers.length; _j < _len1; _j++) {
              layer = lLayers[_j];
              _this.makeLayer(layer);
            }
            _this.trigger("TiledLevelLoaded", _this);
            return null;
          });
          return null;
        }
      });
      return this;
    },
    getTile: function(r, c, l) {
      var layer, tile;
      if (l == null) {
        l = 0;
      }
      layer = this._layerArray[l];
      if ((layer == null) || r < 0 || r >= layer.height || c < 0 || c >= layer.width) {
        return null;
      }
      tile = layer.tiles[c + r * layer.width];
      if (tile) {
        return tile;
      } else {
        return void 0;
      }
    },
    init: function() {
      this._layerArray = [];
      return this;
    }
  });

}).call(this);
