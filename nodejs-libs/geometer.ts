import common_tools = require("./CommonTools");

export interface IPoint2D{
	x	:	number;
	y	:	number;
}

export interface ILine{
	a	:	number;
	b	:	number;
	c	:	number;
	is_more_horizon?	:	boolean;
}

export var get_parellel_line : (line : ILine, dist : number) => ILine[] = function(line, dist) {
	var delta_c = dist * Math.sqrt(line.a * line.a + line.b * line.b);
	console.log("delta_c", delta_c)
	var new_line1 = common_tools.object_clone(line);
	var new_line2 = common_tools.object_clone(line);
	new_line1.c += delta_c;
	new_line2.c -= delta_c;
	return [new_line1, new_line2];
}

export var get_vertical_line : (line : ILine, cross_pt : IPoint2D) => ILine = function(line, cross_pt) {
	var new_line = common_tools.object_clone(line);
	var old_a = new_line.a;
	new_line.a = - new_line.b;
	new_line.b = old_a;
	new_line.c = -(new_line.a * cross_pt.x + new_line.b * cross_pt.y);
	return new_line;
}

export var cal_line : (pt1 : IPoint2D, pt2 : IPoint2D) => ILine = function(p1, p2){
	var delta_x = p1.x - p2.x;
	var delta_y = p1.y - p2.y;
	var a : number, b : number , is_more_horizon : boolean;
	if(Math.abs(delta_x) > Math.abs(delta_y)){
		a = delta_y / delta_x;
		b = -1;
		is_more_horizon = true;
	}else{
		a = -1;
		b = delta_x / delta_y;
		is_more_horizon = false;
	}
	var line : ILine = {
		a : a,
		b : b,
		c : (-a * p1.x - b * p1.y - a * p2.x - b * p2.y) / 2,
		is_more_horizon : is_more_horizon
	};
	return line;
}


export var cal_delta_c_sigh = function (line : ILine, abs_delta_c : number, check_point : IPoint2D){
	var pos_p : IPoint2D = {
		x : null,
		y : null
	};
	if(line.is_more_horizon){
		pos_p.x = 0;
		pos_p.y = line.c + abs_delta_c;
	}else{
		pos_p.y = 0;
		pos_p.x = line.c + abs_delta_c;
	}

	return is_same_side(line, pos_p, check_point) ? 1 : -1;
}

export var is_same_side : (line : ILine, p1 : IPoint2D, p2 : IPoint2D) => boolean = function(line : ILine, p1 : IPoint2D, p2 : IPoint2D){
	return (line.a * p1.x + line.b * p1.y + line.c) * (line.a * p2.x + line.b * p2.y + line.c) > 0;
}

export var is_point_on_line : (p1 : IPoint2D, p2 : IPoint2D, check_point : IPoint2D) => boolean = function(p1 : IPoint2D, p2 : IPoint2D, check_point : IPoint2D){
	return (p1.x - check_point.x) * (check_point.x - p2.x) >= 0 && (p1.y - check_point.y) * (check_point.y - p2.y) >= 0;
}

export var cal_cross : (line1 : ILine, line2 : ILine) => IPoint2D = function (line1 : ILine, line2 : ILine){
	// line1: a1 * x + b1 * y + c1 = 0
	// line2: a2 * x + b2 * y + c2 = 0
	// line1 => a1a2 * x + b1a2 * y + c1 * a2 = 0
	// line2 => a1a2 * x + b2a1 * y + c2 * a1 = 0
	//	line1-line2 => (b1a2 - b2a1)y + c1a2 - c2a1 = 0

	var some = line1.b * line2.a - line2.b * line1.a;
	if(Math.abs(some) < 0.00000001){
		// parallel
		return null;
	}else{
		var cross_y = (line2.c * line1.a - line1.c * line2.a) / some;
		var cross_x = line1.is_more_horizon ? (-line2.c - line2.b * cross_y ) / line2.a : (-line1.c - line1.b * cross_y ) / line1.a;
		return {
			x : cross_x,
			y : cross_y
		};
	}
}