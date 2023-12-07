/**
 * @author Zachary Wartell, ...
 * 
 * math2D.js is a set of 2D geometry related math functions and classes.
 * 
 * Students are given a initial set of classes and functions are expected to extend these and add
 * additional functions to this file.
 * 
 */

/*
 * test equality of 2 floating point numbers
 * @param {Number} a - double
 * @param {Number} b - double (default Number)
 * @returns {Function|equal.Mat3}
 */
function equal(a,b)
{    
    return Math.abs(a-b)< Number.EPSILON;
}

/*
 * test equality of a 32 bit float and 64 bit float
 * @param {Number} a - 32 bit float
 * @param {Number} b - 64 bit float
 * @returns {Function|equal.Mat3}
 */
function equalfd(a,b)
{        
    // \todo [Wartell] find better way to do this ... 
    /* AFIK - Javascript lacks a 32bit float EPISLON
            - JS seems to lack any proper float to double conversion
    */
    var stupid = new Float32Array([b]); 
    return Math.abs(a-stupid[0])< Number.EPSILON;
}





/*******************************************************************************************
********************************************************************************************

2D Math

*********************************************************************************************
*******************************************************************************************/

/**
 * @author Zachary Wartell
 * Constructor of Mat2, a 2x2 matrix 
 * 
 * For efficiency we use a Typed Array.  Elements are stored in 'column major' layout, i.e.
 * for matrix M with math convention M_rc (r=row,c=column)
 *    this.array = [ M_00, M_10,    // first column
 *                   M_01, M_11 ];  // second column
 *                   
 *                   
 * column major order is consistent with OpenGL and GLSL
 *                   
 * @param {null}                  
 * @returns {Mat2}
 */
class Mat2
{
    constructor()
    {
        this.array = new Float32Array(4);
        this.array.set([1.0, 0.0, 
                        0.0, 1.0]);
    };
    
    /**
     * @author Zachary Wartell
     * 'get' returns element in column c, row r of this Mat2
     * @param {Number} r - row 
     * @param {Number} c - column 
     * @returns {Number}
     */
    get (r, c)
    {
        return this.array[c*2+r];
    };
    
    /**
     * @author Zachary Wartell
     * 'set' sets element at column c, row r to value 'val'.
     * @param {Number} r - row 
     * @param {Number} c - column 
     * @param {Number} val - value
     * @returns {Number}
     */
    set (r, c, val)
    {
        this.array[c*2+r] = val;
    };
    
    /**
     * @author Zachary Wartell
     * 'det' return the determinant of this Mat2
     * @returns {Number}
     */
    det ()
    {
        /*
        * \todo needs to be implemented
        */    
        return 0;
    };
}


class Vec2
{

    /**
     * @author Zachary Wartell 
     * Constructor of Vec2. Vec2 is used to represent coordinates of geometric points or vectors. 
     * Technically Vec2 is treated as '2x1 column matrix' in math2D.js
     * 
     * @param {null | Vec2 | [Number, Number] | Number, Number }
     */
    constructor()    
    {
        if (arguments.length === 0)
        {// no arguements, so initial to 0's
            this.array = new Float32Array(2);
            this.array.set([0.0, 0.0]);
        }
        else if (arguments.length === 1)
        {// 1 argument, ...
            if (arguments[0] instanceof Vec2)
            {// argument is Vec2, so copy it
                this.array = new Float32Array(arguments[0].array);
            }
            else if (arguments[0] instanceof Array)
            {// argument is Array, so copy it
                this.array = new Float32Array(arguments[0]);
            }
        }
        else if (arguments.length === 2)
        {// 1 argument, ...
            if (typeof arguments[0] === "number")
            {// arguments are 2 numbers, so copy it
                this.array = new Float32Array([arguments[0],arguments[1]]);
            }
        }        
    };

    /**
     * @author Zachary Wartell 
     *  Vec2 - provide shorter syntax for setting/getting x and y coordinates (see math2d_test for examples).
     */
    get x()   { return this.array[0]; }
    set x(x_) { this.array[0] = x_; }

    get y()   { return this.array[1]; }
    set y(y_) { this.array[1]=y_; }

    /*
    * Set this Vec2 coordinates to values stored in 'v'
    * @param {Array | Float32Array | Vec3} v
    * @returns {undefined}
    */
    set (v)
    {    
        if (v instanceof Array)
        {
            this.array.set(v);
        }
        else if (v instanceof Float32Array)
        {
            this.array.set(v);
        }    
        else if (v instanceof Vec2)
        {
            this.array.set(v.array);
        }            
        else
            throw new Error("Unsupported Type");
    };

    /**
     * @author Zachary Wartell 
     * Add Vec2 'v' to this Vec2
     * @param {Vec2} v    
     */
    add (v)
    {
        this.array.set([this.array[0] + v.array[0], this.array[1] + v.array[1]]);
    };

    /**
     * @author Zachary Wartell 
     * Subtract Vec2 'v' from this Vec2
     * @param {Vec2} v    
     */
    sub (v)
    {
        /*
        * \todo needs to be implemented
        */    
    };

    /**
     * @author Zachary Wartell 
     * Treat this Vec2 as a column matrix and multiply it by Mat2 'm' to it's left, i.e.
     * 
     * v = m * v
     * 
     * @param {Mat2} m    
     */
    multiply (m)
    {
        /*
        * \todo needs to be implemented
        */
        return 0;
    };

    /**
     * @author Zachary Wartell
     * Treat this Vec2 as a row matrix and multiply it by Mat2 'm' to it's right, i.e.
     * 
     * v = v * m
     * 
     * @param {Mat2} m
     */
    rightMultiply (m)
    {
        /*
        * \todo needs to be implemented
        */
        return 0;
    };

    /**
     * @author Zachary Wartell
     * Return the dot product of this Vec2 with Vec2 'v'
     * @param {Vec2} v    
     * @return {Number}
     */
    dot (v)
    {
        /*
        * \todo needs to be implemented
        */
        return 0;
    };

    /**
     * @author Zachary Wartell
     * multiply this Vec2 by scalar value \a s
     * @param {Number} s     
     */
    mul (s)
    {
        if (!(typeof s === "number")) throw "Type Check Violation!";
        this.array[0] *= s;
        this.array[1] *= s;
    }

    /**
     * @author Zachary Wartell 
     * Return the magnitude (i.e. length) of of this Vec2 
     * @return {Number}
     */
    mag ()
    {
        /*
        * \todo needs to be implemented
        */
        return 0;
    };


}

/**
 * @author Zachary Wartell && ...
 * Compute the barycentric coordinate of point 'p' with respect to barycentric coordinate system
 * defined by points p0,p1,p2.
 * 
 * @param {Vec2} p  - point to compute the barycentric coordinate of
 * @param {Vec2} p0 - first point of barycentric coordinate system
 * @param {Vec2} p1 - second point of barycentric coordinate system
 * @param {Vec2} p2 - third point of barycentric coordinate system
 * @returns {[Number, Number, Number]} - array with barycentric coordinates of 'p' assuming alpha,beta,gamma are matched to p0,p1,p2.
 */
function barycentric (p,p0, p1, p2)
{
    /*
     * \todo needs to be implemented
     */    
    var detT = (p1[1] - p2[1]) * (p0[0] - p2[0]) + (p2[0] - p1[0]) * (p0[1] - p2[1]);
    var u = ((p1[1] - p2[1]) * (p[0] - p2[0]) + (p2[0] - p1[0]) * (p[1] - p2[1])) / detT;
    var v = ((p2[1] - p0[1]) * (p[0] - p2[0]) + (p0[0] - p2[0]) * (p[1] - p2[1])) / detT;
    var w = 1 - u - v;

    return [u, v, w];
}

/**
 * @author Zachary Wartell && ... 
 * Compute distance between point 'p' and the (infinite) line through points 'p0' and 'p1'
 * @param {Vec2} p  - point for which we are computing distance
 * @param {Vec2} p0 - first point on line
 * @param {Vec2} p1 - second point on line
 * @returns {undefined}
 */
function pointLineDist(p, p0, p1)
{
     /*
     * \todo needs to be implemented
     */    

    var x = p[0], y = p[1];
    var x0 = p0[0], y0 = p0[1];
    var x1 = p1[0], y1 = p1[1];

    var numerator = Math.abs((x1 - x0) * (y0 - y) - (x0 - x) * (y1 - y0));
    var denominator = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));

    return numerator / denominator;

}

/**
 * @author Zachary Wartell && ... 
 * Compute distance between point 'p' and the line segment through points 'p0' and 'p1'
 * @param {Vec2} p0 - first point on line
 * @param {Vec2} p1 - second point on line
 * @param {Vec2} p  - point for which we are computing distance
 * @returns {undefined}
 * 
 * Resource: https://www.geometrictools.com/Documentation/DistancePointLine.pdf
 */
function pointSegmentDist(p,p0, p1)
{
     /*
     * \todo needs to be implemented
     */
    return 0;
}

/**
 * @author Zachary Wartell && ... 
 * This contains misc. code for testing the functions in this file.
 * Note, the tests are not meant to be comprehensive, but rather only provide examples.
 * 
 * Students can add to this function for testing their code...
 * @returns {undefined}
 */
function math2d_test()
{
    var M1 = new Mat2();    
    var v0 = new Vec2(), v1 = new Vec2([5.0,5.0]), v2, 
            vx = new Vec2([1.0,0.0]),
            vy = new Vec2([0.0,1.0]);
    
    v0.x = 1.0;
    v0.y = 2.0;
    v0.y += 1.0;
    v2 = new Vec2(v0);
    v2.add(v1);
    console.assert(v2.x === 6 && v2.y === 8);
    
    vx.multiply(M1);       
    vy.multiply(M1);  
           
    console.assert(equalfd(vy.x,-Math.sin(rad)) && equalfd (vy.y,Math.cos(rad)) &&
                   equalfd(vx.x, Math.cos(rad)) && equalfd (vx.y,Math.sin(rad)));
     
    po_h.x = 0; po_h.y = 0; po_h.w = 1;
    
    vx_h.multiply(M2);
    vy_h.multiply(M2);
    po_h.multiply(M2);    
    console.assert(equalfd(vy_h.x,-Math.sin(rad)) && equalfd (vy_h.y,Math.cos(rad)) &&
                   equalfd(vx_h.x, Math.cos(rad)) && equalfd (vx_h.y,Math.sin(rad)));    
    
    /* \todo add more tests */
}
