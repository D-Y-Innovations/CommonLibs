import geometer = require('./geometer');

//
var CONSTANTS_RADIUS_OF_EARTH = 6371000;			/* meters (m)		*/
var DBL_EPSILON = 0.000000000000000001
var M_PI = 3.1415926;
var M_REG = 180;
var M_DEG_TO_RAD = M_PI / M_REG;
var M_RAD_TO_DEG = M_REG / M_PI;

//
type IVecPoint = geometer.IPoint2D;
export interface IRawGeoPoint{
	lon : number[];
	lat : number[];
}
export interface IGeoPoint{
	lon	:	number;
	lat	:	number;
}
interface  IReference{
	lon_rad	:	number;
	lat_rad	:	number;
	sin_lat	:	number;
	cos_lat	:	number;
}

export interface IGeoGraphic {
	map_projection_project_points : (geo_pts : IGeoPoint[]) => IVecPoint[];
	map_projection_reproject_points : (vec_pts : IVecPoint[]) => IGeoPoint[];
}

//
export var regToFloat : (pts_in_reg : IRawGeoPoint[])=> IGeoPoint[] = function(pts_in_reg){
	var pts_in_float : IGeoPoint[] = [];
	pts_in_reg.forEach(function(corner){
		pts_in_float.push({
			lon : corner.lon[0] + corner.lon[1] / 60 + corner.lon[2] / 3600,
			lat : corner.lat[0] + corner.lat[1] / 60 + corner.lat[2] / 3600
		});
	})
	return pts_in_float;
};

//
export var createGeoTool = function(point_ref : IGeoPoint){
	var ref_lat_rad = point_ref.lat * M_DEG_TO_RAD;
	var ref_lon_rad = point_ref.lon * M_DEG_TO_RAD;
	var reference : IReference = {
		lat_rad : ref_lat_rad,
		lon_rad : ref_lon_rad,
		sin_lat : Math.sin(ref_lat_rad),
		cos_lat : Math.cos(ref_lat_rad)
	};
	
	var map_projection_project : (geo_pt : IGeoPoint) => IVecPoint = function(geo_point : IGeoPoint)
	{
		var lat_rad = geo_point.lat * M_DEG_TO_RAD;
		var lon_rad = geo_point.lon * M_DEG_TO_RAD;
	
		var sin_lat = Math.sin(lat_rad);
		var cos_lat = Math.cos(lat_rad);
		var cos_d_lon = Math.cos(lon_rad - reference.lon_rad);
	
        var cos_val = reference.sin_lat * sin_lat + reference.cos_lat * cos_lat * cos_d_lon;
        cos_val = cos_val > 1.0 ? 1.0 : cos_val;
        cos_val = cos_val < -1.0 ? -1.0 : cos_val;
        var c = Math.acos(cos_val);
		var k = (Math.abs(c) < DBL_EPSILON) ? 1.0 : (c / Math.sin(c));
		
		return {
			x : k * cos_lat * Math.sin(lon_rad - reference.lon_rad) * CONSTANTS_RADIUS_OF_EARTH,
			y : k * (reference.cos_lat * sin_lat - reference.sin_lat * cos_lat * cos_d_lon) * CONSTANTS_RADIUS_OF_EARTH
		};
	};
	
	var map_projection_reproject : (geo_pt : IVecPoint) => IGeoPoint = function(vec_point : IVecPoint)
	{
		var x_rad = vec_point.x / CONSTANTS_RADIUS_OF_EARTH;
		var y_rad = vec_point.y / CONSTANTS_RADIUS_OF_EARTH;
		var c = Math.sqrt(x_rad * x_rad + y_rad * y_rad);
		var sin_c = Math.sin(c);
		var cos_c = Math.cos(c);
	
		var lat_rad;
		var lon_rad;
	
		if (Math.abs(c) > DBL_EPSILON) {
			lat_rad = Math.asin(cos_c * reference.sin_lat + (y_rad * sin_c * reference.cos_lat) / c);
			lon_rad = (reference.lon_rad + Math.atan2(x_rad * sin_c, c * reference.cos_lat * cos_c - y_rad * reference.sin_lat * sin_c));
	
		} else {
			lat_rad = reference.lat_rad;
			lon_rad = reference.lon_rad;
		}
		
		return {
			lat	: lat_rad * M_RAD_TO_DEG,
			lon	: lon_rad * M_RAD_TO_DEG,
		}
	};
	
	var processPoints : <T1,T2>(src_pts : Array<T1>, proc_func:(pt:T1)=>T2) => Array<T2> = function(src_pts, proc_func){
		var dst_pts = [];
		src_pts.forEach(function(src_pt){
			dst_pts.push(proc_func(src_pt));
		});
		return dst_pts;
	}
	
	return {
		map_projection_project_points : function(geo_pts : Array<IGeoPoint>){
			return processPoints(geo_pts, map_projection_project);
		},
		map_projection_reproject_points : function(vec_pts : Array<IVecPoint>){
			return processPoints(vec_pts, map_projection_reproject);
		}
	};
};




