intRegex = /\d+/
floatRegex = /\d+\.\d+/
boolRegex = /true|false/
parseProp = (v) -> switch
    when intRegex.test v then parseInt v
    when floatRegex.test v  then parseFloat v
    when boolRegex.test v then v == "true"
    else v

Crafty.c "TiledLevel",
    makeTiles : (ts, drawType) ->
        {image: tsImage, firstgid: firstgid, imagewidth: tsWidth} =ts
        {imageheight: tsHeight, tilewidth: tWidth, tileheight: tHeight} = ts
        {tileproperties: tsProperties, properties: genericProperties} = ts
        @tileHeights ||= {}
        tNum = firstgid
        xCount = tsWidth/tWidth | 0
        yCount = tsHeight/tHeight | 0
        sMap = {}
        for i in [0...yCount * xCount] by 1
            @tileHeights[tNum] = tHeight
            posx = i % xCount
            posy = i / xCount | 0 
            sName = "tileSprite#{tNum}"
            tName = "tile#{tNum}"
            sMap[sName] = [posx, posy]
            nComp = 
                comp: "2D, #{drawType}, #{sName}, MapTile"
                prop: {}
                init: ->
                    @addComponent(@comp)
                    @attr(@prop)
            buildProperties = (props) ->
                if props?
                    for name, value of props
                        if name == "components"
                            nComp.comp += ", #{value}"
                        else
                            nComp.prop[name] = parseProp value
                null
            buildProperties genericProperties
            buildProperties tsProperties[tNum - firstgid] if tsProperties
            Crafty.c tName, nComp
            tNum++ 
        Crafty.sprite(tWidth, tHeight, tsImage, sMap)
        return null

    makeLayer : (layer) ->
        layerDetails = switch layer.type
            when "tilelayer" then @makeTileLayer layer
            when "objectgroup" then @makeObjectLayer layer
            else []
        @_layerArray.push(layerDetails)
        return null
    
    makeObjectLayer: (layer) ->
        layerDetails = []
        for obj in layer.objects
            {gid: gid, width: w, height: h, x: x, y: y, properties: props} = obj
            components = if gid then "tile#{gid}" else "MapObject, 2D"
            components += ", #{props.components}" if props and props.components
            e = Crafty.e(components)
            e.x = x
            e.y = y
            e.y -= @tileHeights[gid] if gid
            e.h = h if h > 0
            e.w = w if w > 0
            for name, value of props
                if name != "components"
                    p = {}
                    p[name] = value
                    e.attr p
        layerDetails
    
    makeTileLayer : (layer) ->
        {data: lData, width: lWidth, height: lHeight} = layer
        layerDetails = {tiles:[], width:lWidth, height:lHeight}

        for tDatum, i in lData
            if tDatum
                tile = Crafty.e "tile#{tDatum}"
                tile.x = (i % lWidth) * tile.w
                tile.y = (i / lWidth | 0) * tile.h
                layerDetails.tiles[i] = tile
        layerDetails

    tiledLevel : (levelURL, drawType) ->
        $.ajax
            type: 'GET'
            url: levelURL
            dataType: 'json'
            data: {}
            async: false
            success: (level) =>
                #console.log level
                {layers: lLayers, tilesets: tss} = level
                drawType = drawType ? "Canvas"
                tsImages = for ts in tss
                    ts.image
                Crafty.load tsImages, =>
                    @makeTiles(ts, drawType) for ts in tss
                    @makeLayer(layer) for layer in lLayers
                    @trigger("TiledLevelLoaded", this)
                    return null
                return null
        return @
        
    getTile: (r,c,l=0)->
        layer = @_layerArray[l]
        return null if not layer? or r < 0 or r>=layer.height or c<0 or c>=layer.width
        tile = layer.tiles[c + r*layer.width]
        
        if tile
            return tile
        else
            return undefined

    init: -> 
        @_layerArray = []
        @
