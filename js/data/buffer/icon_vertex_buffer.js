'use strict';

var util = require('../../util/util');
var Buffer = require('./buffer');

module.exports = GlyphVertexBuffer;

function GlyphVertexBuffer(buffer) {
    Buffer.call(this, buffer);
}

GlyphVertexBuffer.prototype = util.inherit(Buffer, {
    defaultLength: 2048 * 16,
    itemSize: 16,

    add: function(x, y, ox, oy, tx, ty, minzoom, maxzoom, labelminzoom) {
        var pos = this.pos,
            pos2 = pos / 2;

        this.resize();

        this.shorts[pos2 + 0] = x;
        this.shorts[pos2 + 1] = y;
        this.shorts[pos2 + 2] = Math.round(ox * 64); // use 1/64 pixels for placement
        this.shorts[pos2 + 3] = Math.round(oy * 64);

        // a_data1
        this.ubytes[pos + 8] /* tex */ = tx / 4;
        this.ubytes[pos + 9] /* tex */ = ty / 4;
        this.ubytes[pos + 10] /* labelminzoom */ = Math.floor((labelminzoom || 0) * 10);

        // a_data2
        this.ubytes[pos + 12] /* minzoom */ = Math.floor((minzoom || 0) * 10); // 1/10 zoom levels: z16 == 160.
        this.ubytes[pos + 13] /* maxzoom */ = Math.floor(Math.min(maxzoom || 25, 25) * 10); // 1/10 zoom levels: z16 == 160.

        this.pos += this.itemSize;
    },

    bind: function(gl, shader, offset, stride) {
        Buffer.prototype.bind.call(this, gl);

        gl.vertexAttribPointer(shader.a_pos, 2, gl.SHORT, false, stride, offset + 0);
        gl.vertexAttribPointer(shader.a_offset, 2, gl.SHORT, false, stride, offset + 4);
        gl.vertexAttribPointer(shader.a_data1, 4, gl.UNSIGNED_BYTE, false, stride, offset + 8);
        gl.vertexAttribPointer(shader.a_data2, 2, gl.UNSIGNED_BYTE, false, stride, offset + 12);
    },

    addColor: function(index, offset, color) {
        var pos = index * this.itemSize + offset;
        this.ubytes[pos + 0] = color[0];
        this.ubytes[pos + 1] = color[1];
        this.ubytes[pos + 2] = color[2];
        this.ubytes[pos + 3] = color[3];
    },

    addOpacity: function(index, offset, opacity) {
        var pos = index * this.itemSize + offset;
        this.ubytes[pos + 0] = Math.round(opacity * 255);
    }
});
