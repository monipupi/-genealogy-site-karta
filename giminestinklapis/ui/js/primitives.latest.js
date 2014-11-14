/**
 * @preserve Basic Primitives orgDiagram v2.0.1
 * (c) Basic Primitives Inc
 *
 * Non-commercial - Free
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * Commercial and government licenses:
 * http://www.basicprimitives.com/pdf/license.pdf
 *
 */


(function () {

	var namespace = function (name) {
		var namespaces = name.split('.'),
			namespace = window,
			index;
		for (index = 0; index < namespaces.length; index += 1) {
			namespace = namespace[namespaces[index]] = namespace[namespaces[index]] || {};
		}
		return namespace;
	};

	namespace("primitives.common");
	namespace("primitives.orgdiagram");
	namespace("primitives.famdiagram");
	namespace("primitives.text");
	namespace("primitives.callout");
	namespace("primitives.connector");
	namespace("primitives.shape");
}());
/*
    Function: primitives.common.isNullOrEmpty
    Indicates whether the specified string is null or an Empty string.
    
    Parameters:
	value - The string to test.
    Returns: 
	true if the value is null or an empty string(""); otherwise, false.
*/
primitives.common.isNullOrEmpty = function (value) {
	var isNullOrEmpty = true,
		string;
	if (value !== undefined && value !== null) {
		string = value.toString();
		if (string.length > 0) {
			isNullOrEmpty = false;
		}
	}
	return isNullOrEmpty;
};

/*
    Function: primitives.common.hashCode
    Returns hash code for specified string value.
    
    Parameters:
	value - The string to calculate hash code.
    Returns:
	int hash code.
*/
primitives.common.hashCode = function (value) {
	var hash = 0,
		character,
		i;
	/*ignore jslint start*/
	if (value.length > 0) {
		for (i = 0; i < value.length; i += 1) {
			character = value.charCodeAt(i);
			hash = ((hash << 5) - hash) + character;
			hash = hash & hash;
		}
	}
	/*ignore jslint end*/
	return hash;
};

/*
    Function: primitives.common.attr
    This method assigns HTML element attributes only if one of them does not match its current value.
    This function helps to reduce number of HTML page layout invalidations.
    
    Parameters:

	element - jQuery selector of element to be updated.
	attr - object containg attributes and new values.
*/
primitives.common.attr = function (element, attr) {
	var attribute,
		value;
	if (element.hasOwnProperty("attrHash")) {
		for (attribute in attr) {
			if (attr.hasOwnProperty(attribute)) {
				value = attr[attribute];
				if (element.attrHash[attribute] != value) {
					element.attrHash[attribute] = value;
					element.attr(attribute, value);
				}
			}
		}
	} else {
		element.attr(attr);
		element.attrHash = attr;
	}
};

/*
    Function: primitives.common.css
    This method assigns HTML element style attributes only if one of them does not match its current value.
    This function helps to reduce number of HTML page layout invalidations.
    
    Parameters:
	element - jQuery selector of element to be updated.
	attr - object containing style attributes.
*/
primitives.common.css = function (element, attr) {
	var attribute,
		value;
	if (element.hasOwnProperty("cssHash")) {
		for (attribute in attr) {
			if (attr.hasOwnProperty(attribute)) {
				value = attr[attribute];
				if (element.cssHash[attribute] != value) {
					element.cssHash[attribute] = value;
					element.css(attribute, value);
				}
			}
		}
	} else {
		element.css(attr);
		element.cssHash = attr;
	}
};

/*
    Function: primitives.common.stopPropogation
    This method uses various approaches used in different browsers to stop event propagation.
    Parameters:
	event - Event to be stopped.
*/
primitives.common.stopPropagation = function (event) {
	if (event.stopPropagation !== undefined) {
		event.stopPropagation();
	} else if (event.cancelBubble !== undefined) {
		event.cancelBubble = true;
	} else if (event.preventDefault !== undefined) {
		event.preventDefault();
	}
};

/*
    Function: primitives.common.indexOf
    This method searches array for specified item and returns index (or -1 if not found)
    Parameters:
	vector - An array through which to search.
	item - The value to search for.
    Returns:
	Index of search item or -1 if not found.
*/
primitives.common.indexOf = function (vector, item) {
	var index,
		treeItem;
	for (index = 0; index < vector.length; index += 1) {
		treeItem = vector[index];
		if (treeItem === item) {
			return index;
		}
	}
	return -1;
};

primitives.common._supportsSVG = null;

/*
    Function: primitives.common.supportsSVG
    Indicates whether the browser supports SVG graphics.
    
    Returns: 
	true if browser supports SVG graphics.
*/
primitives.common.supportsSVG = function () {
	if (primitives.common._supportsSVG === null) {
		primitives.common._supportsSVG = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")
			|| document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.0");
	}
	return primitives.common._supportsSVG;
};

primitives.common._supportsVML = null;

/*
    Function: primitives.common.supportsVML
    Indicates whether the browser supports VML graphics. It is applicable to Internet Explorer only. This graphics mode is depricated in favour of SVG.
    
    Returns: 
	true if browser supports VML graphics.
*/
primitives.common.supportsVML = function () {
	var div,
		shape;
	if (primitives.common._supportsVML === null) {
		primitives.common._supportsVML = false;
		if (!jQuery.support.opacity) {
			div = document.createElement('div');
			div = document.body.appendChild(div);
			div.innerHTML = '<v:shape adj="1" />';
			shape = div.firstChild;
			shape.style.behavior = "url(#default#VML)";
			primitives.common._supportsVML = shape ? typeof shape.adj === "object" : false;
			div.parentNode.removeChild(div);
		}
	}
	return primitives.common._supportsVML;
};

primitives.common._supportsCanvas = null;

/*
    Function: primitives.common.supportsCanvas
    Indicates whether the browser supports HTML Canvas graphics.
    
    Returns: 
	true if browser supports HTML Canvas graphics.
*/
primitives.common.supportsCanvas = function () {
	if (primitives.common._supportsCanvas === null) {
		primitives.common._supportsCanvas = !!window.HTMLCanvasElement;
	}
	return primitives.common._supportsCanvas;
};

primitives.common.createGraphics = function (preferred, widget) {
	var result = null,
		modes,
		key,
		index;

	modes = [preferred];
	for (key in primitives.common.GraphicsType) {
		if (primitives.common.GraphicsType.hasOwnProperty(key)) {
			modes.push(primitives.common.GraphicsType[key]);
		}
	}
	for (index = 0; result === null && index < modes.length; index += 1) {
		switch (modes[index]) {
			case 2/*primitives.common.GraphicsType.VML*/:
				if (primitives.common.supportsVML()) {
					result = new primitives.common.VmlGraphics(widget);
				}
				break;
			case 0/*primitives.common.GraphicsType.SVG*/:
				if (primitives.common.supportsSVG()) {
					result = new primitives.common.SvgGraphics(widget);
				}
				break;
			case 1/*primitives.common.GraphicsType.Canvas*/:
				if (primitives.common.supportsCanvas()) {
					result = new primitives.common.CanvasGraphics(widget);
				}
				break;
		}
	}
	return result;
};

/*
    Function: primitives.common.getColorHexValue
     Converts color string into HEX color string.
    
    Parameters:
	color - regular HTML color string.

    Returns: 
	    Color value in form of HEX string.
*/
primitives.common.getColorHexValue = function (color) {
	var digits,
		red,
		green,
		blue,
		rgb,
		colorIndex,
		colorKey;
	if (color.substr(0, 1) === '#') {
		return color;
	}

	/*ignore jslint start*/
	digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
	/*ignore jslint end*/
	if (digits !== null && digits.length > 0) {
		red = parseInt(digits[2], 10);
		green = parseInt(digits[3], 10);
		blue = parseInt(digits[4], 10);

		/*ignore jslint start*/
		rgb = ((red << 16) | (green << 8) | blue).toString(16);
		/*ignore jslint end*/
		return digits[1] + "000000".substr(0, 6 - rgb.length) + rgb;
	}
	if (primitives.common.ColorHexs === undefined) {
		primitives.common.ColorHexs = {};
		colorIndex = 0;
		for (colorKey in primitives.common.Colors) {
			if (primitives.common.Colors.hasOwnProperty(colorKey)) {
				primitives.common.ColorHexs[colorKey.toUpperCase()] = primitives.common.Colors[colorKey];
				colorIndex += 1;
			}
		}
	}

	return primitives.common.ColorHexs[color.toUpperCase()];
};

/*
    Function: primitives.common.getColorName
     Converts color string into HTML color name string or return hex color string.
    
    Parameters:
	color - regular HTML color string.

    Returns: 
	    HTML Color name or HEX string.
*/
primitives.common.getColorName = function (color) {
	var colorIndex,
		colorKey;
	color = primitives.common.getColorHexValue(color);

	if (primitives.common.ColorNames === undefined) {
		primitives.common.ColorNames = {};
		colorIndex = 0;
		for (colorKey in primitives.common.Colors) {
			if (primitives.common.Colors.hasOwnProperty(colorKey)) {
				primitives.common.ColorNames[primitives.common.Colors[colorKey]] = colorKey;
				colorIndex += 1;
			}
		}
	}

	return primitives.common.ColorNames[color];
};

/*
    Function: primitives.common.getRed
        Gets red value of HEX color string.
    
    Parameters:
	color - HEX string color value.

    Returns: 
	    Int value.
*/
primitives.common.getRed = function (color) {
	if (color.substr(0, 1) === '#' && color.length === 7) {
		return parseInt(color.substr(1, 2), 16);
	}
	return null;
};

/*
    Function: primitives.common.getGreen
        Gets green value of HEX color string.

    Parameters:
	color - HEX string color value.
    
    Returns: 
	    Int value.
*/
primitives.common.getGreen = function (color) {
	if (color.substr(0, 1) === '#' && color.length === 7) {
		return parseInt(color.substr(3, 2), 16);
	}
	return null;
};

/*
    Function: primitives.common.getBlue
        Gets blue value of HEX color string.
    
    Parameters:
	color - HEX string color value.

    Returns: 
	    Int value.
*/
primitives.common.getBlue = function (color) {
	if (color.substr(0, 1) === '#' && color.length === 7) {
		return parseInt(color.substr(5, 2), 16);
	}
	return null;
};

/*
    Function: primitives.common.beforeOpacity
        Calculates before opacity color value producing color you need after applying opacity.
    
    Parameters:
	color - Color you need after applying opacity.
	opacity - Value of opacity.

    Returns: 
	    HEX color value.
*/
primitives.common.beforeOpacity = function (color, opacity) {
	var common = primitives.common,
		red,
		green,
		blue,
		rgb;
	color = common.getColorHexValue(color);

	red = Math.ceil((common.getRed(color) - (1.0 - opacity) * 255.0) / opacity);
	green = Math.ceil((common.getRed(color) - (1.0 - opacity) * 255.0) / opacity);
	blue = Math.ceil((common.getRed(color) - (1.0 - opacity) * 255.0) / opacity);

	/*ignore jslint start*/
	rgb = ((red << 16) | (green << 8) | blue).toString(16);
	/*ignore jslint end*/
	return '#' + "000000".substr(0, 6 - rgb.length) + rgb;
};

/*
    Function: primitives.common.highestContrast
        This function calculates contrast between base color and two optional first and second colors
        and returns optional color having highest contrast.
    
    Parameters:
	baseColor - Base color to compare with.
	firstColor - First color.
    secondColor - Second color.

    Returns: 
	    Color value.
*/
primitives.common.highestContrast = function (baseColor, firstColor, secondColor) {
	var result = firstColor,
		common = primitives.common,
		key = baseColor + "," + firstColor  + "," + secondColor;

	if (common.highestContrasts === undefined) {
		common.highestContrasts = {};
	}
	if (common.highestContrasts.hasOwnProperty(key)) {
		result = common.highestContrasts[key];
	} else {
		if (common.luminosity(firstColor, baseColor) < common.luminosity(secondColor, baseColor)) {
			result = secondColor;
		}
		common.highestContrasts[key] = result;
	}
	return result;
};

/*
    Function: primitives.common.luminosity
        This function calculates luminosity between two HEX string colors.
    
    Parameters:
	firstColor - First color.
    secondColor - Second color.

    Returns: 
	    Luminosity value
*/
primitives.common.luminosity = function (firstColor, secondColor) {
	var result,
		common = primitives.common,
		first = common.getColorHexValue(firstColor),
		second = common.getColorHexValue(secondColor),
		firstLuminosity =
          0.2126 * Math.pow(common.getRed(first) / 255.0, 2.2)
        + 0.7152 * Math.pow(common.getRed(first) / 255.0, 2.2)
        + 0.0722 * Math.pow(common.getRed(first) / 255.0, 2.2),
		secondLuminosity =
          0.2126 * Math.pow(common.getRed(second) / 255.0, 2.2)
        + 0.7152 * Math.pow(common.getRed(second) / 255.0, 2.2)
        + 0.0722 * Math.pow(common.getRed(second) / 255.0, 2.2);

	if (firstLuminosity > secondLuminosity) {
		result = (firstLuminosity + 0.05) / (secondLuminosity + 0.05);
	}
	else {
		result = (secondLuminosity + 0.05) / (firstLuminosity + 0.05);
	}

	return result;
};
var mouseHandled2 = false;
jQuery(document).mouseup(function () {
    mouseHandled2 = false;
});

jQuery.widget("ui.mouse2", {
    version: "1.10.1",
    options: {
        cancel: "input,textarea,button,select,option",
        distance: 1,
        delay: 0
    },
    _mouseInit: function (element2) {
        var that = this;

        this.element2 = element2;
        this.element2
			.bind("mousedown." + this.widgetName, function (event) {
			    return that._mouseDown(event);
			})
			.bind("click." + this.widgetName, function (event) {
			    if (true === jQuery.data(event.target, that.widgetName + ".preventClickEvent")) {
			        jQuery.removeData(event.target, that.widgetName + ".preventClickEvent");
			        event.stopImmediatePropagation();
			        return false;
			    }
			});

        this.started = false;
    },

    // make sure destroying one instance of mouse doesn't mess with
    // other instances of mouse
    _mouseDestroy: function () {
        this.element2.unbind("." + this.widgetName);
        if (this._mouseMoveDelegate) {
            jQuery(document)
				.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate)
				.unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
        }
    },

    _mouseDown: function (event) {
        // don't let more than one widget handle mouseStart
        if (mouseHandled2) { return; }

        // we may have missed mouseup (out of window)
        (this._mouseStarted && this._mouseUp(event)); //ignore jslint

        this._mouseDownEvent = event;

        var that = this,
			btnIsLeft = (event.which === 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? jQuery(event.target).closest(this.options.cancel).length : false);
        if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
            return true;
        }

        this.mouseDelayMet = !this.options.delay;
        if (!this.mouseDelayMet) {
            this._mouseDelayTimer = setTimeout(function () { //ignore jslint
                that.mouseDelayMet = true;
            }, this.options.delay);
        }

        if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
            this._mouseStarted = (this._mouseStart(event) !== false);
            if (!this._mouseStarted) {
                event.preventDefault();
                return true;
            }
        }

        // Click event may never have fired (Gecko & Opera)
        if (true === jQuery.data(event.target, this.widgetName + ".preventClickEvent")) {
            jQuery.removeData(event.target, this.widgetName + ".preventClickEvent");
        }

        // these delegates are required to keep context
        this._mouseMoveDelegate = function (event) {
            return that._mouseMove(event);
        };
        this._mouseUpDelegate = function (event) {
            return that._mouseUp(event);
        };
        jQuery(document)
			.bind("mousemove." + this.widgetName, this._mouseMoveDelegate)
			.bind("mouseup." + this.widgetName, this._mouseUpDelegate);

        event.preventDefault();

        mouseHandled2 = true;
        return true;
    },

    _mouseMove: function (event) {
        // IE mouseup check - mouseup happened when mouse was out of window
        if (jQuery.ui.ie && (!document.documentMode || document.documentMode < 9) && !event.button) {
            return this._mouseUp(event);
        }

        if (this._mouseStarted) {
            this._mouseDrag(event);
            return event.preventDefault();
        }

        if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
            this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
            (this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));//ignore jslint
        }

        return !this._mouseStarted;
    },

    _mouseUp: function (event) {
        jQuery(document)
			.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate)
			.unbind("mouseup." + this.widgetName, this._mouseUpDelegate);

        if (this._mouseStarted) {
            this._mouseStarted = false;

            if (event.target === this._mouseDownEvent.target) {
                jQuery.data(event.target, this.widgetName + ".preventClickEvent", true);
            }

            this._mouseStop(event);
        }

        return false;
    },

    _mouseDistanceMet: function (event) {
        return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
    },

    _mouseDelayMet: function (/* event */) {
        return this.mouseDelayMet;
    },

    // These are placeholder methods, to be overriden by extending plugin
    _mouseStart: function (/* event */) { },
    _mouseDrag: function (/* event */) { },
    _mouseStop: function (/* event */) { },
    _mouseCapture: function (/* event */) { return true; }
});
/*
    Enum: primitives.common.AdviserPlacementType
        Defines item placement in tree relative to parent.
    
    Auto - Layout manager defined.
    Left - Item placed on the left side of parent.
    Right - Item placed on the right side of parent.
*/
primitives.common.AdviserPlacementType =
{
	Auto: 0,
	Left: 2,
	Right: 3
};

primitives.orgdiagram.AdviserPlacementType = primitives.common.AdviserPlacementType;
/*
    Enum: primitives.common.VerticalAlignmentType
    Defines text label alignment inside text box boundaries.
    
    Center - Positooned in the middle of the text box
    Left - Aligned to the begging of the text box
    Right - Aligned to the end of text box
*/
primitives.common.VerticalAlignmentType =
{
	Top: 0,
	Middle: 1,
	Bottom: 2
};
/*
    Enum: primitives.common.UpdateMode
        Defines redraw mode of diagram.
    
    Recreate - Forces widget to make a full chart redraw. It is equivalent to initial chart creation. 
    It removes everything from chart layout and recreares all elements again. For example when you 
    open chart in jQuery UI dDialog you have to use this mode, since jQuery UI invalidates VML graphics elements in the DOM, so
    the only way to update chart is to recreate its contents.
    Refresh - This update mode is optimized for widget fast redraw caused by resize or changes of 
	next options: <primitives.orgdiagram.Config.items>, <primitives.orgdiagram.Config.cursorItem> 
	or <primitives.orgdiagram.Config.selectedItems>.
    PositonHighlight - This update mode redraws only <primitives.orgdiagram.Config.highlightItem>.

    See Also:
      <primitives.orgdiagram.Config.update>
*/
primitives.common.UpdateMode =
{
	Recreate: 0,
	Refresh: 1,
	PositonHighlight: 2
};

primitives.orgdiagram.UpdateMode = primitives.common.UpdateMode;
/*
    Enum: primitives.text.TextOrientationType
        Defines label orientation type.
    
    Horizontal - Regular horizontal text.
    RotateLeft - Rotate all text 90 degree.
    RotateRight - Rotate all text 270 degree.
*/
primitives.text.TextOrientationType =
{
	Horizontal: 0,
	RotateLeft: 1,
	RotateRight: 2,
	Auto: 3
};
primitives.common.SideFlag =
{
	Top: 1,
	Right: 2,
	Bottom: 4,
	Left: 8
};
/*
    Enum: primitives.common.ConnectorShapeType
        Defines connector shape style between two rectangles.
    
    SingleLine - Single line.
    DoubleLine - Double line.
*/
primitives.common.ShapeType =
{
	Rectangle: 0,
	Oval: 1,
	Triangle: 2,
	CrossOut: 3,
	Circle: 4,
	Rhombus: 5,
    None: 6
};
/*
    Enum: primitives.common.SelectionPathMode
        Defines the display mode for items between root item of diagram and selected items.
    
    None - Selection path items placed and sized as regular diagram items.
    FullStack - Selection path items are shown in normal template mode.
*/
primitives.common.SelectionPathMode =
{
	None: 0,
	FullStack: 1
};

primitives.orgdiagram.SelectionPathMode = primitives.common.SelectionPathMode;
primitives.common.SegmentType =
{
	Line: 0,
	Move: 1,
	QuadraticArc: 2,
	CubicArc: 3,
	Dot: 4
};
/*
    Enum: primitives.common.RenderingMode
    This enumeration is used as option in arguments of rendering events.
    It helps to tell template initialization stage, 
    for example user can widgitize some parts of template on create
    and update and refresh them in template update stage.
    
    Create - Template is just created.
    Update - Template is reused and update needed.
*/
primitives.common.RenderingMode =
{
	Create: 0,
	Update: 1
};
/*
    Enum: primitives.common.PlacementType
        Defines element placement relative to rectangular area.
    
    Auto - Depends on implementation
    Left - Left side
    Top - Top side
    Right - Right side
    Bottom - Bottom side
    TopLeft - Top left side
    TopRight - Top right side
    BottomLeft - Bottom left side
    BottomRight - Bottom right side
	LeftTop - Left Top side
	LeftBottom - Left Bottom side
	RightTop - Right Top side
    RightBottom - Right Bottom side
*/
primitives.common.PlacementType =
{
	Auto: 0,
	TopLeft: 8,
	Top: 1,
	TopRight: 2,
	RightTop: 11,
	Right: 3,
	RightBottom: 12,
	BottomRight: 4,
	Bottom: 5,
	BottomLeft: 6,
	LeftBottom: 10,
	Left: 7,
	LeftTop: 9
};
/*
    Enum: primitives.common.PageFitMode
        Defines diagram auto fit mode.
    
    None - All diagram items are shown in normal template mode.
    PageWidth - Diagram tries to layout and auto size items in order to fit diagram into available page width.
    PageHeight - Diagram tries to layout and auto size items in order to fit diagram into available page height.
    FitToPage - Diagram tries to layout and auto size items in order to fit diagram into available page size.
*/
primitives.common.PageFitMode =
{
	None: 0,
	PageWidth: 1,
	PageHeight: 2,
	FitToPage: 3
};

primitives.orgdiagram.PageFitMode = primitives.common.PageFitMode;
/*
    Enum: primitives.common.OrientationType
        Defines diagram orientation type.
    
    Top - Vertical orientation having root item at the top.
	Bottom - Vertical orientation having root item at the bottom.
    Left - Horizontal orientation having root item on the left.
    Right - Horizontal orientation having root item on the right.
*/
primitives.common.OrientationType =
{
	Top: 0,
	Bottom: 1,
	Left: 2,
	Right: 3
};

primitives.orgdiagram.OrientationType = primitives.common.OrientationType;
/*
    Enum: primitives.common.LineType
        Defines type of line pattern. Dash and dot intervals depend on line width. 
    
    Solid - Regular solid line.
    Dotted - Dots.
    Dashed - Dashes.
*/
primitives.common.LineType =
{
	Solid: 0,
	Dotted: 1,
	Dashed: 2
};
primitives.common.Layers =
{
    BackgroundAnnotations: 1,
    Connector: 2,
	Highlight: 3,
	Marker: 4,
	Label : 5,
	Cursor: 6,
	Item: 7,
	ForegroundAnnotations: 8,
	Annotation: 9,
	Controls: 10
};
primitives.common.LabelType =
{
	Regular: 0,
	Dummy: 1,
	Fixed: 2
};
/*
    Enum: primitives.orgdiagram.ItemType
        Defines diagram item type.
    
    Regular - Regular item.
    Assistant - Child item which is placed at separate level above all other children, but below parent item. It has connection on its side.
    Adviser - Child item which is placed at the same level as parent item. It has connection on its side.
    SubAssistant - Child item which is placed at separate level above all other children, but below parent item.  It has connection on its top.
    SubAdviser - Child item placed at the same level as parent item. It has connection on its top.
    GeneralPartner - Child item placed at the same level as parent item and visually grouped with it together via sharing common parent and children.
	LimitedPartner - Child item placed at the same level as parent item and visually grouped with it via sharing common children.
	AdviserPartner - Child item placed at the same level as parent item. It has connection on its side. It is visually grouped with it via sharing common children.
*/
primitives.orgdiagram.ItemType =
{
	Regular: 0,
	Assistant: 1,
	Adviser: 2,
	SubAssistant: 4,
	SubAdviser: 5,
	GeneralPartner: 6,
	LimitedPartner: 7,
	AdviserPartner: 8
};
/*
    Enum: primitives.common.HorizontalAlignmentType
    Defines text label alignment inside text box boundaries.
    
    Center - Positooned in the middle of the text box
    Left - Aligned to the begging of the text box
    Right - Aligned to the end of text box
*/
primitives.common.HorizontalAlignmentType =
{
	Center: 0,
	Left: 1,
	Right: 2
};
/*
    Enum: primitives.common.GroupByType
        Defines the way items grouped in multiparent chart.
    
    Parents - Keep parents together where it is possible.
    Children - Keep children together.
*/
primitives.common.GroupByType =
{
	Parents: 0,
	Children: 1
};
/*
    Enum: primitives.ocommon.GraphicsType
        Graphics type. 
    
    VML - Vector Markup Language. It is only graphics mode available in IE6, IE7 and IE8.
    SVG - Scalable Vector Graphics. Proportionally scales on majority of device. It is not available on Android 2.3 devices and earlier.
    Canvas - HTML canvas graphics. It is available everywhere except IE6, IE7 and IE8. It requires widget redraw after zooming page.
*/
primitives.common.GraphicsType =
{
	SVG: 0,
	Canvas: 1,
	VML: 2
};
/*
    Enum: primitives.common.Enabled
        Defines option state.
    
    Auto - Option state is auto defined.
    True - Enabled.
    False - Disabled.
*/
primitives.common.Enabled =
{
	Auto: 0,
	True: 1,
	False: 2
};
/*
    Enum: primitives.common.ConnectorType
        Defines diagram connectors style for dot and line elements.
    
    Squared - Connector lines use only right angles.
    Angular - Connector lines use angular lines comming from common vertex.
    Curved - Connector lines are splines comming from common vertex.
*/
primitives.common.ConnectorType =
{
	Squared: 0,
	Angular: 1,
	Curved: 2
};

primitives.orgdiagram.ConnectorType = primitives.common.ConnectorType;
primitives.common.ConnectorStyleType =
{
    Extra: 0,
    Regular: 1,
    Highlight: 2
};
/*
    Enum: primitives.common.ConnectorShapeType
        Defines connector shape style between two rectangles.
    
    SingleLine - Single line.
    DoubleLine - Double line.
*/
primitives.common.ConnectorShapeType =
{
	OneWay: 0,
	TwoWay: 1
};
/*
    Enum: primitives.common.Colors
        Named colors.

*/
primitives.common.Colors =
{
	AliceBlue: "#f0f8ff",
	AntiqueWhite: "#faebd7",
	Aqua: "#00ffff",
	Aquamarine: "#7fffd4",
	Azure: "#f0ffff",

	Beige: "#f5f5dc",
	Bisque: "#ffe4c4",
	Black: "#000000",
	BlanchedAlmond: "#ffebcd",
	Blue: "#0000ff",
	BlueViolet: "#8a2be2",
	Brown: "#a52a2a",
	BurlyWood: "#deb887",
	Bronze: "#cd7f32",

	CadetBlue: "#5f9ea0",
	ChartReuse: "#7fff00",
	Chocolate: "#d2691e",
	Coral: "#ff7f50",
	CornflowerBlue: "#6495ed",
	Cornsilk: "#fff8dc",
	Crimson: "#dc143c",
	Cyan: "#00ffff",
	DarkBlue: "#00008b",
	DarkCyan: "#008b8b",
	DarkGoldenrod: "#b8860b",
	DarkGray: "#a9a9a9",
	DarkGreen: "#006400",
	DarkKhaki: "#bdb76b",
	DarkMagenta: "#8b008b",
	DarkOliveGreen: "#556b2f",
	Darkorange: "#ff8c00",
	DarkOrchid: "#9932cc",
	DarkRed: "#8b0000",
	DarkSalmon: "#e9967a",
	DarkSeaGreen: "#8fbc8f",
	DarkSlateBlue: "#483d8b",
	DarkSlateGray: "#2f4f4f",
	DarkTurquoise: "#00ced1",
	DarkViolet: "#9400d3",
	DeepPink: "#ff1493",
	DeepSkyBlue: "#00bfff",
	DimGray: "#696969",
	DodgerBlue: "#1e90ff",

	FireBrick: "#b22222",
	FloralWhite: "#fffaf0",
	ForestGreen: "#228b22",
	Fuchsia: "#ff00ff",

	Gainsboro: "#dcdcdc",
	GhostWhite: "#f8f8ff",
	Gold: "#ffd700",
	Goldenrod: "#daa520",
	Gray: "#808080",
	Green: "#008000",
	GreenYellow: "#adff2f",

	Honeydew: "#f0fff0",
	Hotpink: "#ff69b4",

	IndianRed: "#cd5c5c",
	Indigo: "#4b0082",
	Ivory: "#fffff0",
	Khaki: "#f0e68c",

	Lavender: "#e6e6fa",
	LavenderBlush: "#fff0f5",
	Lawngreen: "#7cfc00",
	Lemonchiffon: "#fffacd",
	LightBlue: "#add8e6",
	LightCoral: "#f08080",
	LightCyan: "#e0ffff",
	LightGoldenrodYellow: "#fafad2",

	LightGray: "#d3d3d3",
	LightGreen: "#90ee90",
	LightPink: "#ffb6c1",
	LightSalmon: "#ffa07a",
	LightSeaGreen: "#20b2aa",
	LightSkyBlue: "#87cefa",
	LightSlateGray: "#778899",
	LightSteelBlue: "#b0c4de",

	LightYellow: "#ffffe0",
	Lime: "#00ff00",
	Limegreen: "#32cd32",
	Linen: "#faf0e6",

	Magenta: "#ff00ff",
	Maroon: "#800000",
	MediumAquamarine: "#66cdaa",
	MediumBlue: "#0000cd",
	MediumOrchid: "#ba55d3",
	MediumPurple: "#9370d8",
	MediumSeaGreen: "#3cb371",
	MediumSlateBlue: "#7b68ee",

	MediumSpringGreen: "#00fa9a",
	MediumTurquoise: "#48d1cc",
	MediumVioletRed: "#c71585",
	MidnightBlue: "#191970",
	MintCream: "#f5fffa",
	MistyRose: "#ffe4e1",
	Moccasin: "#ffe4b5",

	NavajoWhite: "#ffdead",
	Navy: "#000080",

	Oldlace: "#fdf5e6",
	Olive: "#808000",
	Olivedrab: "#6b8e23",
	Orange: "#ffa500",
	OrangeRed: "#ff4500",
	Orchid: "#da70d6",

	PaleGoldenRod: "#eee8aa",
	PaleGreen: "#98fb98",
	PaleTurquoise: "#afeeee",
	PaleVioletRed: "#d87093",
	Papayawhip: "#ffefd5",
	Peachpuff: "#ffdab9",
	Peru: "#cd853f",
	Pink: "#ffc0cb",
	Plum: "#dda0dd",
	PowderBlue: "#b0e0e6",
	Purple: "#800080",

	Red: "#ff0000",
	RosyBrown: "#bc8f8f",
	RoyalBlue: "#4169e1",

	SaddleBrown: "#8b4513",
	Salmon: "#fa8072",
	SandyBrown: "#f4a460",
	SeaGreen: "#2e8b57",
	Seashell: "#fff5ee",
	Sienna: "#a0522d",
	Silver: "#c0c0c0",
	SkyBlue: "#87ceeb",
	SlateBlue: "#6a5acd",
	SlateGray: "#708090",
	Snow: "#fffafa",
	SpringGreen: "#00ff7f",
	SteelBlue: "#4682b4",

	Tan: "#d2b48c",
	Teal: "#008080",
	Thistle: "#d8bfd8",
	Tomato: "#ff6347",
	Turquoise: "#40e0d0",

	Violet: "#ee82ee",

	Wheat: "#f5deb3",
	White: "#ffffff",
	WhiteSmoke: "#f5f5f5",

	Yellow: "#ffff00",
	YellowGreen: "#9acd32"
};
/*
    Enum: primitives.common.ChildrenPlacementType
        Defines children placement shape.
    
    Auto - Children placement auto defined.
    Vertical - Children form vertical column.
    Horizontal - Children placed horizontally.
    Matrix - Children placed in form of matrix.
*/
primitives.common.ChildrenPlacementType =
{
	Auto: 0,
	Vertical: 1,
	Horizontal: 2,
	Matrix: 3
};

primitives.orgdiagram.ChildrenPlacementType = primitives.common.ChildrenPlacementType;
/*
    Enum: primitives.common.AnnotationType
        Defines type of annotation object.
    
    Connector - Connector lines between two rectangular areas.
    Shape - Shape around rectanglur area.
    HighlightPath - Use highlight properties for connector lines between items.
*/
primitives.common.AnnotationType =
{
	Connector: 0,
	Shape: 1,
    HighlightPath: 2
};
/*
    Enum: primitives.common.Visibility
        Defines nodes visibility mode.
    
    Auto - Auto select best visibility mode.
    Normal - Show node in normal template mode.
    Dot - Show node as dot.
    Line - Show node as line.
    Invisible - Make node invisible.

    See Also:

      <primitives.orgdiagram.Config.minimalVisibility>
*/
primitives.common.Visibility =
{
	Auto: 0,
	Normal: 1,
	Dot: 2,
	Line: 3,
	Invisible: 4
};
/*
    Enum: primitives.common.ZOrderType
        Defines elements Z order. This option is used to place annotations relative to chart.
    
    Auto - Auto selects best order depending on type of element.
    Background - Place element in chart background.
    Foreground - Place element into foreground.
*/
primitives.common.ZOrderType =
{
	Auto: 0,
	Background: 1,
	Foreground: 2
};
/*
    Class: primitives.common.RenderEventArgs
	    Rendering event details class.
*/
primitives.common.RenderEventArgs = function () {
	/*
	Property: element
	    jQuery selector referencing template's root element.
    */
	this.element = null;

	/*
	Property: context
	    Reference to item.
    */
	this.context = null;

	/*
	Property: templateName
		This is template name used to render this item.

		See Also:
		<primitives.orgdiagram.TemplateConfig>
		<primitives.orgdiagram.Config.templates> collection property.
    */
	this.templateName = null;

	/*
	Property: renderingMode
	    This option indicates current template state.

    Default:
        <primitives.common.RenderingMode.Update>

	See also:
	    <primitives.common.RenderingMode>
    */
	this.renderingMode = null;

	/*
	Property: isCursor
	    Rendered item is cursor.
    */
	this.isCursor = false;

	/*
	Property: isSelected
	    Rendered item is selected.
    */
	this.isSelected = false;
};
primitives.common.Callout = function (graphics) {
	this.m_graphics = graphics;

	this.pointerPlacement = 0/*primitives.common.PlacementType.Auto*/;
	this.cornerRadius = "10%";
	this.offset = 0;
	this.opacity = 1;
	this.lineWidth = 1;
	this.pointerWidth = "10%";
	this.borderColor = "#000000"/*primitives.common.Colors.Black*/;
	this.lineType = 0/*primitives.common.LineType.Solid*/;
	this.fillColor = "#d3d3d3"/*primitives.common.Colors.LightGray*/;

	this.m_map = [[8/*primitives.common.PlacementType.TopLeft*/, 7/*primitives.common.PlacementType.Left*/, 6/*primitives.common.PlacementType.BottomLeft*/],
                [1/*primitives.common.PlacementType.Top*/, null, 5/*primitives.common.PlacementType.Bottom*/],
                [2/*primitives.common.PlacementType.TopRight*/, 3/*primitives.common.PlacementType.Right*/, 4/*primitives.common.PlacementType.BottomRight*/]
	];
};

primitives.common.Callout.prototype.draw = function (snapPoint, position) {
	position = new primitives.common.Rect(position).offset(this.offset);

	var pointA = new primitives.common.Point(position.x, position.y),
	pointB = new primitives.common.Point(position.right(), position.y),
	pointC = new primitives.common.Point(position.right(), position.bottom()),
	pointD = new primitives.common.Point(position.left(), position.bottom()),
	snapPoints = [null, null, null, null, null, null, null, null],
	points = [pointA, pointB, pointC, pointD],
	radius = this.m_graphics.getPxSize(this.cornerRadius, Math.min(pointA.distanceTo(pointB), pointB.distanceTo(pointC))),
	segments,
	placementType,
	point,
	element,
	index,
	attr;

	if (snapPoint !== null) {
		placementType = (this.pointerPlacement === 0/*primitives.common.PlacementType.Auto*/) ? this._getPlacement(snapPoint, pointA, pointC) : this.pointerPlacement;
		if (placementType !== null) {
			snapPoints[placementType] = snapPoint;
		}
	}

	segments = [];
	for (index = 0; index < points.length; index += 1) {
		this._drawSegment(segments, points[0], points[1], points[2], this.pointerWidth, radius, snapPoints[1], snapPoints[2]);
		point = points.shift();
		points.push(point);
		point = snapPoints.shift();
		snapPoints.push(point);
		point = snapPoints.shift();
		snapPoints.push(point);
	}

	attr = {};
	if (this.fillColor !== null) {
		attr.fillColor = this.fillColor;
		attr.opacity = this.opacity;
	}
	if (this.borderColor !== null) {
		attr.borderColor = this.borderColor;
	}
	attr.lineWidth = this.lineWidth;
	attr.lineType = this.lineType;

	element = this.m_graphics.polyline(segments, attr);
};

primitives.common.Callout.prototype._getPlacement = function (point, point1, point2) {
	var row = null,
		column = null;
	if (point.x < point1.x) {
		row = 0;
	}
	else if (point.x > point2.x) {
		row = 2;
	}
	else {
		row = 1;
	}
	if (point.y < point1.y) {
		column = 0;
	}
	else if (point.y > point2.y) {
		column = 2;
	}
	else {
		column = 1;
	}
	return this.m_map[row][column];
};

primitives.common.Callout.prototype._drawSegment = function (segments, pointA, pointB, pointC, base, radius, sideSnapPoint, cornerSnapPoint) {
	var pointA1 = this._offsetPoint(pointA, pointB, radius),
		pointB1 = this._offsetPoint(pointB, pointA, radius),
		pointB2 = this._offsetPoint(pointB, pointC, radius),
		pointS,
		pointS1,
		pointS2;

	base = this.m_graphics.getPxSize(base, pointA.distanceTo(pointB) / 2.0);

	if (segments.length === 0) {
		segments.push(new primitives.common.MoveSegment(pointA1));
	}
	if (sideSnapPoint !== null) {
		pointS = this._betweenPoint(pointA, pointB);
		pointS1 = this._offsetPoint(pointS, pointA, base);
		pointS2 = this._offsetPoint(pointS, pointB, base);
		segments.push(new primitives.common.LineSegment(pointS1));
		segments.push(new primitives.common.LineSegment(sideSnapPoint));
		segments.push(new primitives.common.LineSegment(pointS2));
	}

	segments.push(new primitives.common.LineSegment(pointB1));
	if (cornerSnapPoint !== null) {
		segments.push(new primitives.common.LineSegment(cornerSnapPoint));
		segments.push(new primitives.common.LineSegment(pointB2));
	}
	else {
		segments.push(new primitives.common.QuadraticArcSegment(pointB, pointB2));
	}
};

primitives.common.Callout.prototype._betweenPoint = function (first, second) {
	return new primitives.common.Point((first.x + second.x) / 2, (first.y + second.y) / 2);
};

primitives.common.Callout.prototype._offsetPoint = function (first, second, offset) {
	var result = new primitives.common.Point(first);
	if (first.x < second.x) {
		result.x += offset;
	}
	else if (first.x > second.x) {
		result.x -= offset;
	}
	else if (first.y < second.y) {
		result.y += offset;
	}
	else {
		result.y -= offset;
	}
	return result;
};

primitives.common.Connector = function (graphics) {
	this.m_graphics = graphics;
	this.transform = null;

	this.orientationType = 0/*primitives.common.OrientationType.Top*/;
	this.panelSize = null;
	this.connectorShapeType = 1/*primitives.common.ConnectorShapeType.TwoWay*/;
	this.offset = 0;
	this.lineWidth = 1;
	this.labelOffset = 4;
	this.labelSize = new primitives.common.Size(60, 30);
	this.lineType = 0/*primitives.common.LineType.Solid*/;
	this.color = "#000000"/*primitives.common.Colors.Black*/;
	this.hasLabel = false;
	this.labelTemplate = null;
	this.labelTemplateHashCode = null;
};

primitives.common.Connector.prototype.draw = function (fromRect, toRect, uiHash) {
    var fromPoint,
        toPoint,
        connectorRect,
        segments = [],
        arrowSegments = [],
	    attr, arrowAttr,
        index, len,
        offsets, tempOffset,
        invertX, invertY,
        segment1, segment2,
        newPoint,
        tipWidth = this.lineWidth * 6,
        tipHeight = this.lineWidth * 4,
        linesOffset = tipHeight * 1.5,
        labelSize,
        labelPlacement,
        minimalGap,
        snapPoint,
        panelSize,
        angle;
    fromRect = new primitives.common.Rect(fromRect).offset(this.offset);
    toRect = new primitives.common.Rect(toRect).offset(this.offset);
    offsets = [];
    switch (this.connectorShapeType) {
        case 1/*primitives.common.ConnectorShapeType.TwoWay*/:
            offsets = [- linesOffset / 2, linesOffset / 2];
            break;
        case 0/*primitives.common.ConnectorShapeType.OneWay*/:
            offsets = [0];
            break;
    }

    this.transform = new primitives.common.Transform();
    this.transform.size = this.panelSize;
    this.transform.setOrientation(this.orientationType);

    /* from rectangle */
    this.transform.transformRect(fromRect.x, fromRect.y, fromRect.width, fromRect.height, false,
        this, function (x, y, width, height) {
            fromRect = new primitives.common.Rect(x, y, width, height);
    });

    /* to rectangle */
    this.transform.transformRect(toRect.x, toRect.y, toRect.width, toRect.height, false,
        this, function (x, y, width, height) {
            toRect = new primitives.common.Rect(x, y, width, height);
        });

    /* label size */
    this.transform.transformRect(0, 0, this.labelSize.width, this.labelSize.height, false,
    this, function (x, y, width, height) {
        labelSize = new primitives.common.Size(width, height);
    });

    /* panel size */
    this.transform.transformRect(0, 0, this.panelSize.width, this.panelSize.height, false,
    this, function (x, y, width, height) {
        panelSize = new primitives.common.Size(width, height);
    });

    minimalGap = Math.max(this.hasLabel ? labelSize.width : 0, tipWidth * 5);
    if (fromRect.right() + minimalGap < toRect.left() || fromRect.left() > toRect.right() + minimalGap) {
        if (fromRect.left() > toRect.right()) {
            fromPoint = new primitives.common.Point(fromRect.left(), fromRect.verticalCenter());
            toPoint = new primitives.common.Point(toRect.right(), toRect.verticalCenter());
        } else {
            fromPoint = new primitives.common.Point(fromRect.right(), fromRect.verticalCenter());
            toPoint = new primitives.common.Point(toRect.left(), toRect.verticalCenter());
        }
        connectorRect = new primitives.common.Rect(fromPoint, toPoint);
        invertY = (fromPoint.y <= toPoint.y);
        invertX = (fromPoint.x < toPoint.x);
        if (connectorRect.height < connectorRect.width) {
            /* horizontal single bended connector between boxes from right side to left side */
            if (connectorRect.height < tipWidth * 2) {
                connectorRect.offset(0, invertY ? tipWidth * 2 : 0, 0, invertY ? 0 : tipWidth * 2);
            }

            for (index = 0, len = offsets.length; index < len; index += 1) {
                tempOffset = offsets[index];
                segments.push(new primitives.common.MoveSegment(fromPoint.x, fromPoint.y + tempOffset));
                segments.push(new primitives.common.QuadraticArcSegment(connectorRect.horizontalCenter(), (invertY ? connectorRect.top() : connectorRect.bottom()) + tempOffset,
                    toPoint.x, toPoint.y + tempOffset));
            }
            
            if (labelSize.width < connectorRect.width / 5 * 2) {
                snapPoint = this._quadraticBezierPoint(fromPoint, new primitives.common.Point(connectorRect.horizontalCenter(), (invertY ? connectorRect.top() : connectorRect.bottom())), toPoint, 0.5);
            } else {
                snapPoint = new primitives.common.Point(fromPoint.x, invertY ? connectorRect.top() : connectorRect.bottom());
            }
            labelPlacement = new primitives.common.Rect(snapPoint.x + (invertX ? linesOffset : -labelSize.width - linesOffset), (invertY ? snapPoint.y - labelSize.height - tipWidth : snapPoint.y + tipWidth), labelSize.width, labelSize.height);
        } else {
            /* horizontal double bended connector between boxes from right side to left side */
            for (index = 0, len = offsets.length; index < len; index += 1) {
                tempOffset = offsets[index];
                segments.push(new primitives.common.MoveSegment(fromPoint.x, fromPoint.y + tempOffset));
                segments.push(new primitives.common.QuadraticArcSegment(connectorRect.horizontalCenter() + tempOffset * (invertY != invertX ? 1 : -1), (invertY ? connectorRect.top() : connectorRect.bottom()) + tempOffset,
                    connectorRect.horizontalCenter() + tempOffset * (invertY != invertX ? 1 : -1), connectorRect.verticalCenter() + tempOffset));
                segments.push(new primitives.common.QuadraticArcSegment(connectorRect.horizontalCenter() + tempOffset * (invertY != invertX ? 1 : -1), (invertY ? connectorRect.bottom() : connectorRect.top()) + tempOffset,
                    toPoint.x, toPoint.y + tempOffset));
            }
            labelPlacement = new primitives.common.Rect(connectorRect.horizontalCenter() + (invertY != invertX ? linesOffset : -(linesOffset + labelSize.width)),
                 connectorRect.verticalCenter() - labelSize.height / 2, labelSize.width, labelSize.height);
        }
    } else {
        if (fromRect.verticalCenter() < toRect.top() || fromRect.verticalCenter() > toRect.bottom()) {
            /* vertical single bended connector between boxes from right side to right side */
            invertX = fromRect.x < panelSize.width / 2;
            fromPoint = new primitives.common.Point(invertX ? fromRect.right() : fromRect.left(), fromRect.verticalCenter());
            toPoint = new primitives.common.Point(invertX ? toRect.right() : toRect.left(), toRect.verticalCenter());
            connectorRect = new primitives.common.Rect(fromPoint, toPoint);
            connectorRect.offset(tipWidth * 10, 0, tipWidth * 10, 0);
            invertY = (fromPoint.y <= toPoint.y);
            for (index = 0, len = offsets.length; index < len; index += 1) {
                tempOffset = offsets[index];
                segments.push(new primitives.common.MoveSegment(fromPoint.x, fromPoint.y + tempOffset));
                segments.push(new primitives.common.QuadraticArcSegment(invertX ? connectorRect.right() + tempOffset * (invertY ? -1 : 1) : connectorRect.left() - tempOffset * (invertY ? -1 : 1), connectorRect.verticalCenter(),
                    invertX ? toRect.right() : toRect.left(), toRect.verticalCenter() - tempOffset));
            }
            snapPoint = this._quadraticBezierPoint(fromPoint, new primitives.common.Point((invertX ? connectorRect.right() : connectorRect.left()), connectorRect.verticalCenter()), toPoint, 0.5);
            labelPlacement = new primitives.common.Rect(snapPoint.x + (invertX ? linesOffset / 2 : -linesOffset / 2 - labelSize.width), snapPoint.y - labelSize.height / 2, labelSize.width, labelSize.height);
        } else {
            fromPoint = new primitives.common.Point(fromRect.horizontalCenter(), fromRect.top());
            toPoint = new primitives.common.Point(toRect.horizontalCenter(), toRect.top());
            connectorRect = new primitives.common.Rect(fromPoint, toPoint);
            connectorRect.offset(0, tipWidth * 7, 0, 0);
            invertX = (fromPoint.x < toPoint.x);
            for (index = 0, len = offsets.length; index < len; index += 1) {
                tempOffset = offsets[index];
                segments.push(new primitives.common.MoveSegment(fromPoint.x + tempOffset, fromPoint.y));
                segments.push(new primitives.common.QuadraticArcSegment(connectorRect.horizontalCenter(), connectorRect.top() - tempOffset * (invertX ? -1 : 1), 
                    toRect.horizontalCenter() - tempOffset, toRect.top()));
            }
            snapPoint = this._quadraticBezierPoint(fromPoint, new primitives.common.Point(connectorRect.horizontalCenter(), connectorRect.top()), toPoint, 0.5);
            labelPlacement = new primitives.common.Rect(snapPoint.x - labelSize.width / 2, snapPoint.y -(this.labelOffset + labelSize.height), labelSize.width, labelSize.height);
        }
    }

    if (segments.length > 0) {
        this.transform.transformSegments(segments, true);

        switch (this.connectorShapeType) {
            case 1/*primitives.common.ConnectorShapeType.TwoWay*/:
                segment2 = segments[segments.length / 2 - 1];
                angle = Math.atan2((segment2.cpY - segment2.y), (segment2.cpX - segment2.x));
                arrowSegments = arrowSegments.concat(this._getArrow(segment2.x, segment2.y, tipWidth, tipHeight, angle));

                /* offset spline end point to make arrow nice*/
                newPoint = this._offsetPoint(new primitives.common.Point(segment2.x, segment2.y), new primitives.common.Point(segment2.cpX, segment2.cpY), tipHeight);
                segment2.x = newPoint.x;
                segment2.y = newPoint.y;

                segment1 = segments[segments.length / 2];
                segment2 = segments[segments.length / 2 + 1];
                angle = Math.atan2((segment2.cpY - segment1.y), (segment2.cpX - segment1.x));
                arrowSegments = arrowSegments.concat(this._getArrow(segment1.x, segment1.y, tipWidth, tipHeight, angle));

                /* offset spline end point to make arrow nice*/
                newPoint = this._offsetPoint(new primitives.common.Point(segment1.x, segment1.y), new primitives.common.Point(segment2.cpX, segment2.cpY), tipHeight);
                segment1.x = newPoint.x;
                segment1.y = newPoint.y;
                break;
            case 0/*primitives.common.ConnectorShapeType.OneWay*/:
                segment2 = segments[segments.length - 1];
                angle = Math.atan2((segment2.cpY - segment2.y), (segment2.cpX - segment2.x));
                arrowSegments = arrowSegments.concat(this._getArrow(segment2.x, segment2.y, tipWidth, tipHeight, angle));

                /* offset spline end point to make arrow nice*/
                newPoint = this._offsetPoint(new primitives.common.Point(segment2.x, segment2.y), new primitives.common.Point(segment2.cpX, segment2.cpY), tipHeight);
                segment2.x = newPoint.x;
                segment2.y = newPoint.y;
                break;
        }

        attr = {};
        if (this.borderColor !== null) {
            attr.borderColor = this.color;
        }
        attr.lineWidth = this.lineWidth;
        attr.lineType = this.lineType;
        this.m_graphics.polyline(segments, attr);

        arrowAttr = {};
        arrowAttr.opacity = 1;
        if (this.fillColor !== null) {
            arrowAttr.fillColor = this.color;
        }
        if (this.borderColor !== null) {
            arrowAttr.borderColor = this.color;
        }
        arrowAttr.lineWidth = 0;

        
        this.m_graphics.polyline(arrowSegments, arrowAttr);

        if (this.hasLabel) {

            this.transform.transformRect(labelPlacement.x, labelPlacement.y, labelPlacement.width, labelPlacement.height, true,
                this, function (x, y, width, height) {
                    labelPlacement = new primitives.common.Rect(x, y, width, height);
                });

            this.m_graphics.template(
                  labelPlacement.x
                , labelPlacement.y
                , 0
                , 0
                , 0
                , 0
                , labelPlacement.width
                , labelPlacement.height
                , this.labelTemplate
                , this.labelTemplateHashCode
                , "onAnnotationLabelTemplateRender"
                , uiHash
                , null
            );
        }
    }
};

primitives.common.Connector.prototype._getArrow = function (offsetX, offsetY, length, width, angle) {
    var result = [],
        index, len,
        point, x, y,
        perimiter = [new primitives.common.Point(length, -width / 2),
            new primitives.common.Point(0, 0),
            new primitives.common.Point(length, width / 2),
            new primitives.common.Point(length / 4 * 3, 0)
    ];

    /* rotate and translate points */
    for (index = 0, len = perimiter.length; index < len; index += 1) {
        point = perimiter[index];
        x = point.x * Math.cos(angle) - point.y * Math.sin(angle);
        y = point.x * Math.sin(angle) + point.y * Math.cos(angle);
        point.x = x + offsetX;
        point.y = y + offsetY;
    }

    /* create arrow shape*/
    result.push(new primitives.common.MoveSegment(perimiter[0].x, perimiter[0].y));
    result.push(new primitives.common.LineSegment(perimiter[1].x, perimiter[1].y));
    result.push(new primitives.common.LineSegment(perimiter[2].x, perimiter[2].y));
    result.push(new primitives.common.QuadraticArcSegment(perimiter[3].x, perimiter[3].y, perimiter[0].x, perimiter[0].y));

    return result;
};

primitives.common.Connector.prototype._quadraticBezierPoint = function (first, control, second, time) {
    return new primitives.common.Point((1 - time) * (1 - time) * first.x + 2 * (1 - time) * time * control.x + time * time * second.x, 
         (1 - time) * (1 - time) * first.y + 2 * (1 - time) * time * control.y + time * time * second.y);
};

primitives.common.Connector.prototype._betweenPoint = function (first, second) {
	return new primitives.common.Point((first.x + second.x) / 2, (first.y + second.y) / 2);
};

primitives.common.Connector.prototype._offsetPoint = function (first, second, offset) {
    var result = null,
        distance = first.distanceTo(second);

    if (distance == 0 || offset == 0) {
        result = new primitives.common.Point(first);
    } else {
        result = new primitives.common.Point(first.x + (second.x - first.x) / distance * offset, first.y + (second.y - first.y) / distance * offset);
    }
	return result;
};

primitives.common.Shape = function (graphics) {
	this.m_graphics = graphics;
	this.transform = null;

	this.orientationType = 0/*primitives.common.OrientationType.Top*/;
	this.panelSize = null;
	this.shapeType = 0/*primitives.common.ShapeType.Rectangle*/;
	this.offset = new primitives.common.Thickness(0, 0, 0, 0);
	this.lineWidth = 1;
	this.labelOffset = 4;
	this.cornerRadius = "10%";
	this.opacity = 1;
	this.fillColor = null;
	this.labelSize = new primitives.common.Size(60, 30);
	this.lineType = 0/*primitives.common.LineType.Solid*/;
	this.borderColor = null;
	this.hasLabel = false;
	this.labelTemplate = null;
	this.labelTemplateHashCode = null;
	this.labelPlacement = 0/*primitives.common.PlacementType.Auto*/;
};

primitives.common.Shape.prototype.draw = function (position, uiHash) {
    var segments = [],
	    attr,
        labelPlacement,
        cpX, cpY,
        calloutShape,
        quarter;

    position = new primitives.common.Rect(position).offset(this.offset);

    this.transform = new primitives.common.Transform();
    this.transform.size = this.panelSize;
    this.transform.setOrientation(this.orientationType);

    /* label size */
    if (this.hasLabel) {
        labelPlacement = this._getLabelPosition(position.x, position.y, position.width, position.height, this.labelSize.width, this.labelSize.height, this.labelOffset, this.labelPlacement);
    }


    switch (this.shapeType) {
        case 0/*primitives.common.ShapeType.Rectangle*/:
            calloutShape = new primitives.common.Callout(this.m_graphics);
            calloutShape.cornerRadius = this.cornerRadius;
            calloutShape.opacity = this.opacity;
            calloutShape.lineWidth = this.lineWidth;
            calloutShape.lineType = this.lineType;
            calloutShape.borderColor = this.borderColor;
            calloutShape.fillColor = this.fillColor;
            calloutShape.draw(null, position);
            break;
        default:
            /* from rectangle */
            this.transform.transformRect(position.x, position.y, position.width, position.height, false,
                this, function (x, y, width, height) {
                    position = new primitives.common.Rect(x, y, width, height);
                });

            switch (this.shapeType) {
                case 4/*primitives.common.ShapeType.Circle*/:
                    quarter = Math.min(position.width / 2.0, position.height / 2.0);
                    position = new primitives.common.Rect(position.horizontalCenter() - quarter, position.verticalCenter() - quarter, quarter * 2.0, quarter * 2.0);
                case 1/*primitives.common.ShapeType.Oval*/:
                    cpX = (position.width / 2) * 0.5522848;
                    cpY = (position.height / 2) * 0.5522848;
                    segments.push(new primitives.common.MoveSegment(position.x, position.verticalCenter()));
                    segments.push(new primitives.common.CubicArcSegment(position.x, position.verticalCenter() - cpY, position.horizontalCenter() - cpX, position.y, position.horizontalCenter(), position.y));
                    segments.push(new primitives.common.CubicArcSegment(position.horizontalCenter() + cpX, position.y, position.right(), position.verticalCenter() - cpY, position.right(), position.verticalCenter()));
                    segments.push(new primitives.common.CubicArcSegment(position.right(), position.verticalCenter() + cpY, position.horizontalCenter() + cpX, position.bottom(), position.horizontalCenter(), position.bottom()));
                    segments.push(new primitives.common.CubicArcSegment(position.horizontalCenter() - cpX, position.bottom(), position.x, position.verticalCenter() + cpY, position.x, position.verticalCenter()));
                    break;
                case 5/*primitives.common.ShapeType.Rhombus*/:
                    segments.push(new primitives.common.MoveSegment(position.horizontalCenter(), position.bottom()));
                    segments.push(new primitives.common.LineSegment(position.left(), position.verticalCenter()));
                    segments.push(new primitives.common.LineSegment(position.horizontalCenter(), position.y));
                    segments.push(new primitives.common.LineSegment(position.right(), position.verticalCenter()));
                    segments.push(new primitives.common.LineSegment(position.horizontalCenter(), position.bottom()));
                    break;
                case 2/*primitives.common.ShapeType.Triangle*/:
                    segments.push(new primitives.common.MoveSegment(position.left(), position.bottom()));
                    segments.push(new primitives.common.LineSegment(position.horizontalCenter(), position.y));
                    segments.push(new primitives.common.LineSegment(position.right(), position.bottom()));
                    segments.push(new primitives.common.LineSegment(position.left(), position.bottom()));
                    break;
                case 3/*primitives.common.ShapeType.CrossOut*/:
                    segments.push(new primitives.common.MoveSegment(position.horizontalCenter(), position.verticalCenter()));
                    segments.push(new primitives.common.LineSegment(position.x, position.y));
                    segments.push(new primitives.common.MoveSegment(position.horizontalCenter(), position.verticalCenter()));
                    segments.push(new primitives.common.LineSegment(position.right(), position.bottom()));
                    segments.push(new primitives.common.MoveSegment(position.horizontalCenter(), position.verticalCenter()));
                    segments.push(new primitives.common.LineSegment(position.right(), position.y));
                    segments.push(new primitives.common.MoveSegment(position.horizontalCenter(), position.verticalCenter()));
                    segments.push(new primitives.common.LineSegment(position.left(), position.bottom()));
                    break;
                default:
                    break;
            }
            this.transform.transformSegments(segments, true);
            attr = {};
            if (this.fillColor !== null) {
                attr.fillColor = this.fillColor;
                attr.opacity = this.opacity;
            }
            if (this.borderColor !== null) {
                attr.borderColor = this.borderColor;
            }
            attr.lineWidth = this.lineWidth;
            attr.lineType = this.lineType;
            this.m_graphics.polyline(segments, attr);
            break;
    }

    if (this.hasLabel) {
        this.m_graphics.template(
              labelPlacement.x
            , labelPlacement.y
            , 0
            , 0
            , 0
            , 0
            , labelPlacement.width
            , labelPlacement.height
            , this.labelTemplate
            , this.labelTemplateHashCode
            , "onAnnotationLabelTemplateRender"
            , uiHash
            , null
        );
    }
};

primitives.common.Shape.prototype._getLabelPosition = function (x, y, width, height, labelWidth, labelHeight, labelOffset, labelPlacement) {
    var result = null;
    switch (labelPlacement) {
        case 1/*primitives.common.PlacementType.Top*/:
            result = new primitives.common.Rect(x + width / 2.0 - labelWidth / 2.0, y - labelOffset - labelHeight, labelWidth, labelHeight);
            break;
        case 2/*primitives.common.PlacementType.TopRight*/:
            result = new primitives.common.Rect(x + width - labelWidth, y - labelOffset - labelHeight, labelWidth, labelHeight);
            break;
        case 8/*primitives.common.PlacementType.TopLeft*/:
            result = new primitives.common.Rect(x, y - labelOffset - labelHeight, labelWidth, labelHeight);
            break;
        case 3/*primitives.common.PlacementType.Right*/:
            result = new primitives.common.Rect(x + width + labelOffset, y + height / 2.0 - labelHeight / 2.0, labelWidth, labelHeight);
            break;
        case 11/*primitives.common.PlacementType.RightTop*/:
            result = new primitives.common.Rect(x + width + labelOffset, y, labelWidth, labelHeight);
            break;
        case 12/*primitives.common.PlacementType.RightBottom*/:
            result = new primitives.common.Rect(x + width + labelOffset, y + height - labelHeight, labelWidth, labelHeight);
            break;
        case 4/*primitives.common.PlacementType.BottomRight*/:
            result = new primitives.common.Rect(x + width - labelWidth, y + height + labelOffset, labelWidth, labelHeight);
            break;
        case 6/*primitives.common.PlacementType.BottomLeft*/:
            result = new primitives.common.Rect(x, y + height + labelOffset, labelWidth, labelHeight);
            break;
        case 7/*primitives.common.PlacementType.Left*/:
            result = new primitives.common.Rect(x - labelWidth - labelOffset, y + height / 2.0 - labelHeight / 2.0, labelWidth, labelHeight);
            break;
        case 9/*primitives.common.PlacementType.LeftTop*/:
            result = new primitives.common.Rect(x - labelWidth - labelOffset, y, labelWidth, labelHeight);
            break;
        case 10/*primitives.common.PlacementType.LeftBottom*/:
            result = new primitives.common.Rect(x - labelWidth - labelOffset, y + height - labelHeight, labelWidth, labelHeight);
            break;
        case 0/*primitives.common.PlacementType.Auto*/: //ignore jslint
        case 5/*primitives.common.PlacementType.Bottom*/: //ignore jslint
        default: //ignore jslint
            result = new primitives.common.Rect(x + width / 2.0 - labelWidth / 2.0, y + height + labelOffset, labelWidth, labelHeight);
            break;
    }
    return result;
};
/*
    Class: primitives.common.Point
    Class represents pair of x and y coordinates that defines a point in 2D plane.

	Parameters:
		point - <primitives.common.Point> object.

	Parameters:
		x - X coordinate of 2D point.
		y - Y coordinate of 2D point.	    
*/
primitives.common.Point = function (arg0, arg1) {
	/*
	Property: x
	    The x coordinate.
    */

	this.x = null;
	/*
	Property: y
	    The y coordinate.
    */

	this.y = null;

	switch (arguments.length) {
		case 1:
			this.x = arg0.x;
			this.y = arg0.y;
			break;
		case 2:
			this.x = arg0;
			this.y = arg1;
			break;
		default:
			break;
	}
};

/*
    Method: distanceTo
        Returns distance to point.

	Parameters:
		point - <primitives.common.Point> object.

	Parameters:
		x - X coordinate of 2D point.
		y - Y coordinate of 2D point.
*/
primitives.common.Point.prototype.distanceTo = function (arg0, arg1) {
	var x2 = 0,
		y2 = 0,
		a,
		b;
	switch (arguments.length) {
		case 1:
			x2 = arg0.x;
			y2 = arg0.y;
			break;
		case 2:
			x2 = arg0;
			y2 = arg1;
			break;
		default:
			break;
	}
	a = this.x - x2;
	b = this.y - y2;
	return Math.sqrt(a * a + b * b);
};

/*
    Method: toString
        Returns rectangle location in form of CSS style string.

    Parameters:
	    units - The string name of units. Uses "px" if not defined.

    Returns:
        CSS style string.
*/
primitives.common.Point.prototype.toString = function (units) {
	var result = "";

	units = (units !== undefined) ? units : "px";

	result += "left:" + this.x + units + ";";
	result += "top:" + this.y + units + ";";

	return result;
};
primitives.common.CubicArcSegment = function (arg0, arg1, arg2, arg3, arg4, arg5) {
	this.x = null;
	this.y = null;

	this.cpX1 = null;
	this.cpY1 = null;

	this.cpX2 = null;
	this.cpY2 = null;

	switch (arguments.length) {
		case 3:
			this.x = arg2.x;
			this.y = arg2.y;
			this.cpX1 = arg0.x;
			this.cpY1 = arg0.y;
			this.cpX2 = arg1.x;
			this.cpY2 = arg1.y;
			break;
		case 6:
			this.cpX1 = arg0;
			this.cpY1 = arg1;
			this.cpX2 = arg2;
			this.cpY2 = arg3;
			this.x = arg4;
			this.y = arg5;
			break;
		default:
			break;
	}

	this.segmentType = 3/*primitives.common.SegmentType.CubicArc*/;
};
primitives.common.DotSegment = function (x, y, radius) {
	this.segmentType = 4/*primitives.common.SegmentType.Dot*/;

	this.x = x;
	this.y = y;
	this.radius = radius;
};
primitives.common.Label = function () {
	this.text = null;
	this.position = null; // primitives.common.Rect
	this.weight = 0;

	this.isActive = true; 
	this.labelType = 0/*primitives.common.LabelType.Regular*/;

	this.labelOrientation = 0/*primitives.text.TextOrientationType.Horizontal*/;
	this.horizontalAlignmentType = 0/*primitives.common.HorizontalAlignmentType.Center*/;
	this.verticalAlignmentType = 2/*primitives.common.VerticalAlignmentType.Bottom*/;
};
primitives.common.LineSegment = function () {
	this.parent = primitives.common.Point.prototype;
	this.parent.constructor.apply(this, arguments);

	this.segmentType = 0/*primitives.common.SegmentType.Line*/;
};

primitives.common.LineSegment.prototype = new primitives.common.Point();
primitives.common.MoveSegment = function () {
	this.parent = primitives.common.Point.prototype;
	this.parent.constructor.apply(this, arguments);

	this.segmentType = 1/*primitives.common.SegmentType.Move*/;
};

primitives.common.MoveSegment.prototype = new primitives.common.Point();
primitives.common.QuadraticArcSegment = function (arg0, arg1, arg2, arg3) {
	this.x = null;
	this.y = null;

	this.cpX = null;
	this.cpY = null;

	switch (arguments.length) {
		case 2:
			this.x = arg1.x;
			this.y = arg1.y;
			this.cpX = arg0.x;
			this.cpY = arg0.y;
			break;
		case 4:
			this.cpX = arg0;
			this.cpY = arg1;
			this.x = arg2;
			this.y = arg3;
			break;
		default:
			break;
	}

	this.segmentType = 2/*primitives.common.SegmentType.QuadraticArc*/;
};
/*
    Class: primitives.common.Rect
    Class describes the width, height and location of rectangle.

	Parameters:
		rect - Copy constructor. It takes as a parameter copy of <primitives.common.Rect> object.

	Parameters:
		pointTopLeft - Top left point <primitives.common.Point> object.
		pointBottomRight - Bottom right point <primitives.common.Point> object.

	Parameters:
		x - The x coordinate of top left corner.
		y - The y coordinate of top left corner.
		width - Rect width.
		height - Rect height.
*/
primitives.common.Rect = function (arg0, arg1, arg2, arg3) {
	/*
	Property: x
	    The location x coordinate.
    */
	this.x = null;
	/*
	Property: y
	    The location y coordinate.
    */
	this.y = null;
	/*
	Property: width
	    The width of rectangle.
    */
	this.width = null;
	/*
	Property: height
	    The height of rectangle.
    */
	this.height = null;

	switch (arguments.length) {
		case 1:
			this.x = arg0.x;
			this.y = arg0.y;
			this.width = arg0.width;
			this.height = arg0.height;
			break;
		case 2:
			this.x = Math.min(arg0.x, arg1.x);
			this.y = Math.min(arg0.y, arg1.y);
			this.width = Math.abs(arg1.x - arg0.x);
			this.height = Math.abs(arg1.y - arg0.y);
			break;
		case 4:
			this.x = arg0;
			this.y = arg1;
			this.width = arg2;
			this.height = arg3;
			break;
		default:
			break;
	}
};

/*
    Method: left
        Gets the x-axis value of the left side of the rectangle.
*/
primitives.common.Rect.prototype.left = function () {
	return this.x;
};

/*
    Method: top
        Gets the y-axis value of the top side of the rectangle.
*/
primitives.common.Rect.prototype.top = function () {
	return this.y;
};

/*
    Method: right
        Gets the x-axis value of the right side of the rectangle.
*/
primitives.common.Rect.prototype.right = function () {
	return this.x + this.width;
};

/*
    Method: bottom
        Gets the y-axis value of the bottom of the rectangle.
*/
primitives.common.Rect.prototype.bottom = function () {
	return this.y + this.height;
};

/*
    Method: verticalCenter
        Gets the y-axis value of the center point of the rectangle.
*/
primitives.common.Rect.prototype.verticalCenter = function () {
	return this.y + this.height / 2.0;
};

/*
    Method: horizontalCenter
        Gets the x-axis value of the center point of the rectangle.
*/
primitives.common.Rect.prototype.horizontalCenter = function () {
	return this.x + this.width / 2.0;
};

/*
    Method: isEmpty
        Gets the value that indicates whether  the rectangle is the Empty rectangle.
*/
primitives.common.Rect.prototype.isEmpty = function () {
	return this.x === null || this.y === null || this.width === null || this.height === null || this.width < 0 || this.height < 0;
};

/*
    Method: offset
        Expands the rectangle by using specified value in all directions.

    Parameters:
	    value - The amount by which to expand or shrink the sides of the rectangle.

    Parameters:
	    left - The amount by which to expand or shrink the left side of the rectangle.	
	    top - The amount by which to expand or shrink the top side of the rectangle.		
	    right - The amount by which to expand or shrink the right side of the rectangle.		
	    bottom - The amount by which to expand or shrink the bottom side of the rectangle.		
*/
primitives.common.Rect.prototype.offset = function (arg0, arg1, arg2, arg3) {
	switch (arguments.length) {
	    case 1:
	        if (arg0 !== null && typeof arg0 == "object") {
	            this.x = this.x - arg0.left;
	            this.y = this.y - arg0.top;

	            this.width = this.width + arg0.left + arg0.right;
	            this.height = this.height + arg0.top + arg0.bottom;
	        } else {
	            this.x = this.x - arg0;
	            this.y = this.y - arg0;

	            this.width = this.width + arg0 * 2.0;
	            this.height = this.height + arg0 * 2.0;
	        }
			break;
		case 4:
			this.x = this.x - arg0;
			this.y = this.y - arg1;

			this.width = this.width + arg0 + arg2;
			this.height = this.height + arg1 + arg3;
			break;
	}
	return this;
};

/*
    Method: translate
        Moves the rectangle to by the specified horizontal and vertical amounts.

    Parameters:
	    x - The amount to move the rectangle horizontally.
	    y - The amount to move the rectangle vertically.
*/
primitives.common.Rect.prototype.translate = function (x, y) {
	this.x = this.x + x;
	this.y = this.y + y;

	return this;
};

/*
    Method: invert
        Inverts rectangle.
*/
primitives.common.Rect.prototype.invert = function () {
	var width = this.width,
		x = this.x;
	this.width = this.height;
	this.height = width;
	this.x = this.y;
	this.y = x;
	return this;
};

/*
    Method: contains
        Indicates whether the rectangle contains the specified point.

    Parameters:
	    point - The point to check.

    Parameters:	
	    x - The x coordinate of the point to check.
	    y - The y coordinate of the point to check.
	
    Returns:
        true if the rectangle contains the specified point; otherwise, false.	
*/
primitives.common.Rect.prototype.contains = function (arg0, arg1) {
	switch (arguments.length) {
		case 1:
			return this.x <= arg0.x && arg0.x <= this.x + this.width && this.y <= arg0.y && arg0.y <= this.y + this.height;
		case 2:
			return this.x <= arg0 && arg0 <= this.x + this.width && this.y <= arg1 && arg1 <= this.y + this.height;
		default:
			return false;
	}
};

/*
    Method: cropByRect
        Crops the rectangle by the boundaries of specified rectangle.

    Parameters:
	    rect - The rectangle to use as the crop boundaries.
*/
primitives.common.Rect.prototype.cropByRect = function (rect) {
	if (this.x < rect.x) {
		this.width -= (rect.x - this.x);
		this.x = rect.x;
	}

	if (this.right() > rect.right()) {
		this.width -= (this.right() - rect.right());
	}

	if (this.y < rect.y) {
		this.height -= (rect.y - this.y);
		this.y = rect.y;
	}

	if (this.bottom() > rect.bottom()) {
		this.height -= this.bottom() - rect.bottom();
	}

	if (this.isEmpty()) {
		this.x = null;
		this.y = null;
		this.width = null;
		this.height = null;
	}

	return this;
};

/*
    Method: overlaps
        Returns true if the rectangle overlaps specified rectangle.

    Parameters:
	    rect - The rectangle to use as overlaping rectangle.
*/
primitives.common.Rect.prototype.overlaps = function (rect) {
	var result = true;
	if (this.x + this.width < rect.x || rect.x + rect.width < this.x || this.y + this.height < rect.y || rect.y + rect.height < this.y) {
		result = false;
	}
	return result;
};

/*
    Method: addRect
        Expands the current rectangle to contain specified rectangle.

    Parameters:
	    rect - The rectangle to contain.

    Parameters:	
	    x - The x coordinate of the point to contain.
	    y - The y coordinate of the point to contain.

	Parameters:
		x - The x coordinate of top left corner.
		y - The y coordinate of top left corner.
		width - Rect width.
		height - Rect height.
*/
primitives.common.Rect.prototype.addRect = function (arg0, arg1, arg2, arg3) {
	var right,
		bottom;
	switch (arguments.length) {
		case 1:
			if (!arg0.isEmpty()) {
				if (this.isEmpty()) {
					this.x = arg0.x;
					this.y = arg0.y;
					this.width = arg0.width;
					this.height = arg0.height;
				}
				else {
					right = Math.max(this.right(), arg0.right());
					bottom = Math.max(this.bottom(), arg0.bottom());

					this.x = Math.min(this.x, arg0.x);
					this.y = Math.min(this.y, arg0.y);
					this.width = right - this.x;
					this.height = bottom - this.y;
				}
			}
			break;
		case 2:
			if (this.isEmpty()) {
				this.x = arg0;
				this.y = arg1;
				this.width = 0;
				this.height = 0;
			}
			else {
				right = Math.max(this.right(), arg0);
				bottom = Math.max(this.bottom(), arg1);

				this.x = Math.min(this.x, arg0);
				this.y = Math.min(this.y, arg1);
				this.width = right - this.x;
				this.height = bottom - this.y;
			}
			break;
		case 4:
			if (this.isEmpty()) {
				this.x = arg0;
				this.y = arg1;
				this.width = arg2;
				this.height = arg3;
			}
			else {
				right = Math.max(this.right(), arg0 + arg2);
				bottom = Math.max(this.bottom(), arg1 + arg3);

				this.x = Math.min(this.x, arg0);
				this.y = Math.min(this.y, arg1);
				this.width = right - this.x;
				this.height = bottom - this.y;
			}
			break;
	}

	return this;
};

/*
    Method: getCSS
        Returns rectangle location and size in form of CSS style object.

    Parameters:
	    units - The string name of units. Uses "px" if not defined.

    Returns:
        CSS style object.
*/
primitives.common.Rect.prototype.getCSS = function (units) {
	units = (units !== undefined) ? units : "px";

	var result = {
		left: this.x + units,
		top: this.y + units,
		width: this.width + units,
		height: this.height + units
	};
	return result;
};

/*
    Method: toString
        Returns rectangle location and size in form of CSS style string.

    Parameters:
	    units - The string name of units. Uses "px" if not defined.

    Returns:
        CSS style string.
*/
primitives.common.Rect.prototype.toString = function (units) {
	var result = "";

	units = (units !== undefined) ? units : "px";

	result += "left:" + this.x + units + ";";
	result += "top:" + this.y + units + ";";
	result += "width:" + this.width + units + ";";
	result += "height:" + this.height + units + ";";

	return result;
};
/*
    Class: primitives.common.Size
    Class describes the size of an object.

	Parameters:
		size - Copy constructor. It takes as a parameter copy of <primitives.common.Size> object.

	Parameters:
		width - The initial width of the instance.
		height - The initial height of the instance.
*/
primitives.common.Size = function (arg0, arg1) {
	/*
	Property: width
	    The value that specifies the width of the size class.
    */

	this.width = 0;

	/*
    Property: height
        The value that specifies the height of the size class.
    */

	this.height = 0;

	switch (arguments.length) {
		case 1:
			this.width = arg0.width;
			this.height = arg0.height;
			break;
		case 2:
			this.width = arg0;
			this.height = arg1;
			break;
		default:
			break;
	}
};

/*
    Method: invert
        Swaps width and height.
*/
primitives.common.Size.prototype.invert = function () {
	var width = this.width;
	this.width = this.height;
	this.height = width;
	return this;
};
/*
    Class: primitives.common.Thickness
    Class describes the thickness of a frame around rectangle.

	Parameters:
		left - The thickness for the left side of the rectangle.
		height - The thickness for the upper side of the rectangle.
        right - The thickness for the right side of the rectangle.
        bottom - The thickness for the bottom side of the rectangle.
*/
primitives.common.Thickness = function (left, top, right, bottom) {
	/*
	Property: left
	    The thickness for the left side of the rectangle.
    */

	this.left = left;

	/*
    Property: top
        The thickness for the upper side of the rectangle.
    */

	this.top = top;

	/*
    Property: right
        The thickness for the right side of the rectangle.
    */
	this.right = right;

	/*
    Property: bottom
        The thickness for the bottom side of the rectangle.
    */
	this.bottom = bottom;
};

/*
    Method: isEmpty
        Gets the value that indicates whether the thickness is the Empty.
*/

primitives.common.Thickness.prototype.isEmpty = function () {
	return this.left === 0 && this.top === 0 && this.right === 0 && this.bottom === 0;
};

/*
    Method: toString
        Returns thickness in form of CSS style string. It is conversion to padding style string.

    Parameters:
	    units - The string name of units. Uses "px" if not defined.

    Returns:
        CSS style string.
*/

primitives.common.Thickness.prototype.toString = function (units) {
	units = (units !== undefined) ? units : "px";

	return this.left + units + ", " + this.top + units + ", " + this.right + units + ", " + this.bottom + units;
};
primitives.common.Graphics = function (widget) {
	this.m_widget = widget;

	this.m_placeholders = {};
	this.m_activePlaceholder = null;

	this.m_cache = new primitives.common.Cache();

	this.boxModel = jQuery.support.boxModel;
	this.graphicsType = null;
	this.hasGraphics = false;
};

primitives.common.Graphics.prototype.clean = function () {
	var key,
		placeholder,
		layerKey,
		layer;
	this.m_cache.clear();

	this.m_cache = null;

	this.m_widget = null;
	for (key in this.m_placeholders) {
		if (this.m_placeholders.hasOwnProperty(key)) {
			placeholder = this.m_placeholders[key];

			for (layerKey in placeholder.layers) {
				if (placeholder.layers.hasOwnProperty(layerKey)) {
					layer = placeholder.layers[layerKey];
					layer.canvas.remove();
					layer.canvas = null;
				}
			}
			placeholder.layers.length = 0;
			placeholder.activeLayer = null;

			placeholder.size = null;
			placeholder.rect = null;
			placeholder.div = null;
		}
	}
	this.m_placeholders.length = 0;
	this.m_activePlaceholder = null;
};

primitives.common.Graphics.prototype.resize = function (name, width, height) {
	var placeholder = this.m_placeholders[name];
	if (placeholder != null) {
		this.resizePlaceholder(placeholder, width, height);
	}
};

primitives.common.Graphics.prototype.resizePlaceholder = function (placeholder, width, height) {
	var layerKey,
		layer;

	placeholder.size = new primitives.common.Size(width, height);
	placeholder.rect = new primitives.common.Rect(0, 0, width, height);

	for (layerKey in placeholder.layers) {
		if (placeholder.layers.hasOwnProperty(layerKey)) {
			layer = placeholder.layers[layerKey];
			if (layer.name !== -1) {
				layer.canvas.css({
					"position": "absolute"
					, "width": "0px"
					, "height": "0px"
				});
			}
		}
	}
};

primitives.common.Graphics.prototype.begin = function () {
	this.m_cache.begin();
};

primitives.common.Graphics.prototype.end = function () {
	this.m_cache.end();
};


primitives.common.Graphics.prototype.reset = function (arg0, arg1) {
	var placeholderName = "none",
		layerName = -1;
	switch (arguments.length) {
		case 1:
			if (typeof arg0 === "string") {
				placeholderName = arg0;
			}
			else {
				layerName = arg0;
			}
			break;
		case 2:
			placeholderName = arg0;
			layerName = arg1;
			break;
	}
	this.m_cache.reset(placeholderName, layerName);
};

primitives.common.Graphics.prototype.activate = function (arg0, arg1) {
	switch (arguments.length) {
		case 1:
			if (typeof arg0 === "string") {
				this._activatePlaceholder(arg0);
				this._activateLayer(-1);
			}
			else {
				this._activatePlaceholder("none");
				this._activateLayer(arg0);
			}
			break;
		case 2:
			this._activatePlaceholder(arg0);
			this._activateLayer(arg1);
			break;
	}
	return this.m_activePlaceholder;
};

primitives.common.Graphics.prototype._activatePlaceholder = function (placeholderName) {
	var placeholder = this.m_placeholders[placeholderName],
		div;
	if (placeholder === undefined) {
		div = null;
		if (placeholderName === "none") {
			div = this.m_widget.element;
		}
		else {
			div = this.m_widget.element.find("." + placeholderName);
		}

		placeholder = new primitives.common.Placeholder(placeholderName);
		placeholder.div = div;
		placeholder.size = new primitives.common.Size(div.innerWidth(), div.innerHeight());
		placeholder.rect = new primitives.common.Rect(0, 0, placeholder.size.width, placeholder.size.height);

		this.m_placeholders[placeholderName] = placeholder;
	}
	this.m_activePlaceholder = placeholder;
};

primitives.common.Graphics.prototype._activateLayer = function (layerName) {
	var layer = this.m_activePlaceholder.layers[layerName],
		placeholder,
		canvas,
		position,
		maximumLayer,
		layerKey;
	if (layer === undefined) {
		placeholder = this.m_activePlaceholder;
		if (layerName === -1) {
			layer = new primitives.common.Layer(layerName);
			layer.canvas = placeholder.div;
		}
		else {
			canvas = jQuery('<div></div>');
			canvas.addClass("Layer" + layerName);
			position = new primitives.common.Rect(placeholder.rect);

			canvas.css({
				"position": "absolute"
				, "width": "0px"
				, "height": "0px"
			});

			maximumLayer = null;
			for (layerKey in placeholder.layers) {
				if (placeholder.layers.hasOwnProperty(layerKey)) {
					layer = placeholder.layers[layerKey];
					if (layer.name < layerName) {
						maximumLayer = (maximumLayer !== null) ? Math.max(maximumLayer, layer.name) : layer.name;
					}
				}
			}

			layer = new primitives.common.Layer(layerName);
			layer.canvas = canvas;

			if (maximumLayer === null) {
				placeholder.div.prepend(layer.canvas[0]);
			} else {
				layer.canvas.insertAfter(placeholder.layers[maximumLayer].canvas);
			}
		}
		placeholder.layers[layerName] = layer;
	}
	this.m_activePlaceholder.activeLayer = layer;
};

primitives.common.Graphics.prototype.text = function (x, y, width, height, label, orientation, horizontalAlignment, verticalAlignment, attr) {
	var placeholder = this.m_activePlaceholder,
		style = {
			"position": "absolute",
			"padding": 0,
			"margin": 0,
			"text-align": this._getTextAlign(horizontalAlignment),
			"font-size": attr["font-size"],
			"font-family": attr["font-family"],
			"font-weight": attr["font-weight"],
			"font-style": attr["font-style"],
			"color": attr["font-color"]
		},
		rotation = "",
		element,
		tdstyle;

	switch (orientation) {
		case 0/*primitives.text.TextOrientationType.Horizontal*/:
		case 3/*primitives.text.TextOrientationType.Auto*/:
			style.left = x;
			style.top = y;
			style.width = width;
			style.height = height;
			break;
		case 1/*primitives.text.TextOrientationType.RotateLeft*/:
			style.left = x + Math.round(width / 2.0 - height / 2.0);
			style.top = y + Math.round(height / 2.0 - width / 2.0);
			style.width = height;
			style.height = width;
			rotation = "rotate(-90deg)";
			break;
		case 2/*primitives.text.TextOrientationType.RotateRight*/:
			style.left = x + Math.round(width / 2.0 - height / 2.0);
			style.top = y + Math.round(height / 2.0 - width / 2.0);
			style.width = height;
			style.height = width;
			rotation = "rotate(90deg)";
			break;
	}

	style["-webkit-transform-origin"] = "center center";
	style["-moz-transform-origin"] = "center center";
	style["-o-transform-origin"] = "center center";
	style["-ms-transform-origin"] = "center center";


	style["-webkit-transform"] = rotation;
	style["-moz-transform"] = rotation;
	style["-o-transform"] = rotation;
	style["-ms-transform"] = rotation;
	style.transform = rotation;


	style["max-width"] = style.width;
	style["max-height"] = style.height;

	label = label.replace(new RegExp("\n", 'g'), "<br/>");
	switch (verticalAlignment) {
		case 0/*primitives.common.VerticalAlignmentType.Top*/:
			element = this.m_cache.get(placeholder.name, placeholder.activeLayer.name, "text");
			if (element === null) {
				element = jQuery("<div></div>");
				element.css(style);
				element.html(label);
				placeholder.activeLayer.canvas.append(element);
				this.m_cache.put(placeholder.name, placeholder.activeLayer.name, "text", element);
			}
			else {
				element.css(style);
				element.html(label);
			}
			break;
		default:
			style["border-collapse"] = "collapse";
			tdstyle = {
				"vertical-align": this._getVerticalAlignment(verticalAlignment),
				"padding": 0
			};
			element = this.m_cache.get(placeholder.name, placeholder.activeLayer.name, "textintable");
			if (element === null) {
				element = jQuery('<table><tbody><tr><td></td></tr></tbody></table>');
				primitives.common.css(element, style);
				element.find("td").css(tdstyle).html(label);
				placeholder.activeLayer.canvas.append(element);
				this.m_cache.put(placeholder.name, placeholder.activeLayer.name, "textintable", element);
			}
			else {
				primitives.common.css(element, style);
				element.find("td").css(tdstyle).html(label);
			}
			break;
	}
};

primitives.common.Graphics.prototype._getTextAlign = function (alignment) {
	var result = null;
	switch (alignment) {
		case 0/*primitives.common.HorizontalAlignmentType.Center*/:
			result = "center";
			break;
		case 1/*primitives.common.HorizontalAlignmentType.Left*/:
			result = "left";
			break;
		case 2/*primitives.common.HorizontalAlignmentType.Right*/:
			result = "right";
			break;
	}
	return result;
};

primitives.common.Graphics.prototype._getVerticalAlignment = function (alignment) {
	var result = null;
	switch (alignment) {
		case 1/*primitives.common.VerticalAlignmentType.Middle*/:
			result = "middle";
			break;
		case 0/*primitives.common.VerticalAlignmentType.Top*/:
			result = "top";
			break;
		case 2/*primitives.common.VerticalAlignmentType.Bottom*/:
			result = "bottom";
			break;
	}
	return result;
};

primitives.common.Graphics.prototype.polyline = function (segments, attr) {
	var fromX = null,
		fromY = null,
		index,
		segment;
	for (index = 0; index < segments.length; index += 1) {
		segment = segments[index];
		switch (segment.segmentType) {
			case 1/*primitives.common.SegmentType.Move*/:
				fromX = Math.round(segment.x) + 0.5;
				fromY = Math.round(segment.y) + 0.5;
				break;
			case 0/*primitives.common.SegmentType.Line*/:
				this.rightAngleLine(fromX, fromY, Math.round(segment.x) + 0.5, Math.round(segment.y) + 0.5, attr);
				break;
			case 4/*primitives.common.SegmentType.Dot*/:
				this.dot(segment.x, segment.y, segment.radius, attr);
				break;
		}
	}
};

primitives.common.Graphics.prototype.dot = function (cx, cy, radius, attr) {
	var placeholder = this.m_activePlaceholder,
		element = this.m_cache.get(placeholder.name, placeholder.activeLayer.name, "dot"),
        style = {
			"position": "absolute",
			"width": radius * 2.0,
			"top": cy - radius + 0.5,
			"left": cx - radius + 0.5,
			"padding": 0,
			"margin": 0,
			"line-height": "0px",
			"overflow": "hidden",
			"height": radius * 2.0,
			"background": attr.fillColor,
			"-moz-border-radius": radius,
			"-webkit-border-radius": radius,
			"-khtml-border-radius": radius,
			"border-radius": radius,
			"font-size": "0px",
			"border-style": "None",
			"border-width": "0px"
		};

		if (element === null) {
			element = jQuery('<div></div>');
			primitives.common.css(element, style);
			placeholder.activeLayer.canvas.append(element);
			this.m_cache.put(placeholder.name, placeholder.activeLayer.name, "dot", element);
		} else {
			primitives.common.css(element, style);
		}
};

primitives.common.Graphics.prototype.rightAngleLine = function (fromX, fromY, toX, toY, attr) {
    var placeholder = this.m_activePlaceholder,
		isVertical = Math.abs(toY - fromY) > Math.abs(toX - fromX),
		lineWidth = attr.lineWidth,
		style = {
			"position": "absolute",
			"top": Math.round(Math.min(fromY, toY) - ((isVertical) ? 0 : lineWidth / 2.0)),
			"left": Math.round(Math.min(fromX, toX) - ((isVertical) ? lineWidth / 2.0 : 0)),
			"padding": 0,
			"margin": 0,
			"opacity": 0.5,
			"line-height": "0px",
			"overflow": "hidden",
			"background": attr.borderColor,
			"font-size": "0px"
		},
		element;

		if (isVertical) {
			style.width = lineWidth;
			style.height = Math.abs(Math.round(toY - fromY));
		} else {
			style.width = Math.abs(Math.round(toX - fromX));
			style.height = lineWidth;
		}

		element = this.m_cache.get(placeholder.name, placeholder.activeLayer.name, "rect");
		if (element === null) {
			element = jQuery("<div></div>");
			primitives.common.css(element, style);
			placeholder.activeLayer.canvas.append(element);
			this.m_cache.put(placeholder.name, placeholder.activeLayer.name, "rect", element);
		} else {
			primitives.common.css(element, style);
		}
};

primitives.common.Graphics.prototype.template = function (x, y, width, height, contentx, contenty, contentWidth, contentHeight, template, hashCode, onRenderTemplate, uiHash, attr) { //ignore jslint
	var placeholder = this.m_activePlaceholder,
		element,
        templateKey = "template" + ((hashCode !== null) ? hashCode : primitives.common.hashCode(template)),
		gap = 0,
		style;

		element = this.m_cache.get(placeholder.name, placeholder.activeLayer.name, templateKey);

		if (attr !== null) {
			if (attr["border-width"] !== undefined) {
				gap = this.boxModel ? this.getPxSize(attr["border-width"]) : 0;
			}
		}

		style = {
			"width": (contentWidth - gap) + "px",
			"height": (contentHeight - gap) + "px",
			"top": (y + contenty) + "px",
			"left": (x + contentx) + "px"
		};

		jQuery.extend(style, attr);

		if (uiHash == null) {
			uiHash = new primitives.common.RenderEventArgs();
		}
		if (element == null) {
			element = jQuery(template);
			jQuery.extend(style, {
				"position": "absolute",
				"overflow": "hidden",
				"padding": "0px",
				"margin": "0px"
			}, attr);
			primitives.common.css(element, style);

			uiHash.element = element;
			uiHash.renderingMode = 0/*primitives.common.RenderingMode.Create*/;

			if (onRenderTemplate !== null) {
				this.m_widget._trigger(onRenderTemplate, null, uiHash);
			}
			placeholder.activeLayer.canvas.append(element);
			this.m_cache.put(placeholder.name, placeholder.activeLayer.name, templateKey, element);
		} else {
			uiHash.element = element;
			uiHash.renderingMode = 1/*primitives.common.RenderingMode.Update*/;
			primitives.common.css(element, style);
			if (onRenderTemplate !== null) {
				this.m_widget._trigger(onRenderTemplate, null, uiHash);
			}
		}
	return element;
};

primitives.common.Graphics.prototype.getPxSize = function (value, base) {
	var result = value;
	if (typeof value === "string") {
		if (value.indexOf("pt") > 0) {
			result = parseInt(value, 10) * 96 / 72;
		}
		else if (value.indexOf("%") > 0) {
			result = parseFloat(value) / 100.0 * base;
		}
		else {
			result = parseInt(value, 10);
		}
	}
	return result;
};
primitives.common.Cache = function () {
	this.threshold = 20;

	this.m_visible = {};
	this.m_invisible = {};
};

primitives.common.Cache.prototype.begin = function () {
	var placeholder,
		type,
		index,
		control;

	for (placeholder in this.m_visible) {
		if (this.m_visible.hasOwnProperty(placeholder)) {
			for (type in this.m_visible[placeholder]) {
				if (this.m_visible[placeholder].hasOwnProperty(type)) {
					for (index = this.m_visible[placeholder][type].length - 1; index >= 0; index -= 1) {
						control = this.m_visible[placeholder][type][index];
						control.css({ "visibility": "hidden" });
						this.m_invisible[placeholder][type].push(control);
					}
					this.m_visible[placeholder][type].length = 0;
				}
			}
		}
    }
};

primitives.common.Cache.prototype.end = function () {
	var placeholder,
		type,
		control;
	for (placeholder in this.m_visible) {
		if (this.m_visible.hasOwnProperty(placeholder)) {
			for (type in this.m_visible[placeholder]) {
				if (this.m_visible[placeholder].hasOwnProperty(type)) {
					control = null;
					if (this.m_invisible[placeholder][type].length > this.threshold) {
						while ((control = this.m_invisible[placeholder][type].pop()) !== undefined) {
							control.remove();
						}
					}
				}
			}
		}
	}
};

primitives.common.Cache.prototype.reset = function (placeholder, layer) {
	placeholder = placeholder + "-" + layer;
	var control = null,
		type,
		index;
	for (type in this.m_visible[placeholder]) {
		if (this.m_visible[placeholder].hasOwnProperty(type)) {
			for (index = this.m_visible[placeholder][type].length - 1; index >= 0; index -= 1) {
				control = this.m_visible[placeholder][type][index];
				this.m_invisible[placeholder][type].push(control);
				control.css({ "visibility": "hidden" });
			}
			this.m_visible[placeholder][type].length = 0;
		}
	}
};

primitives.common.Cache.prototype.clear = function () {
	var placeholder,
		type,
		control;
	for (placeholder in this.m_visible) {
		if (this.m_visible.hasOwnProperty(placeholder)) {
			for (type in this.m_visible[placeholder]) {
				if (this.m_visible[placeholder].hasOwnProperty(type)) {
					control = null;
					while ((control = this.m_visible[placeholder][type].pop()) !== undefined) {
						control.remove();
					}
					while ((control = this.m_invisible[placeholder][type].pop()) !== undefined) {
						control.remove();
					}
				}
			}
		}
	}
};

primitives.common.Cache.prototype.get = function (placeholder, layer, type) {
	placeholder = placeholder + "-" + layer;
	var result = null;
	if (this.m_visible[placeholder] === undefined) {
		this.m_visible[placeholder] = {};
		this.m_invisible[placeholder] = {};
	}
	if (this.m_visible[placeholder][type] === undefined) {
		this.m_visible[placeholder][type] = [];
		this.m_invisible[placeholder][type] = [];
	}
	result = this.m_invisible[placeholder][type].pop() || null;
	if (result !== null) {
		this.m_visible[placeholder][type].push(result);
		result.css({ "visibility": "inherit" });
	}
	return result;
};

primitives.common.Cache.prototype.put = function (placeholder, layer, type, control) {
	placeholder = placeholder + "-" + layer;
	this.m_visible[placeholder][type].push(control);
};
primitives.common.CanvasGraphics = function (widget) {
	this.parent = primitives.common.Graphics.prototype;

	this.parent.constructor.apply(this, arguments);

	this.graphicsType = 1/*primitives.common.GraphicsType.Canvas*/;
	this.m_maximum = 6000;
};

primitives.common.CanvasGraphics.prototype = new primitives.common.Graphics();

primitives.common.CanvasGraphics.prototype.clean = function () {
	var key,
		placeholder,
		layerKey,
		layer;
	for (key in this.m_placeholders) {
		if (this.m_placeholders.hasOwnProperty(key)) {
			placeholder = this.m_placeholders[key];
			for (layerKey in placeholder.layers) {
				if (placeholder.layers.hasOwnProperty(layerKey)) {
					layer = placeholder.layers[layerKey];
					if (layer.canvascanvas !== null) {
						layer.canvascanvas.remove();
						layer.canvascanvas = null;
					}
				}
			}
		}
	}
	this.parent.clean.apply(this, arguments);
};

primitives.common.CanvasGraphics.prototype._activatePlaceholder = function (placeholderName) {
	var placeholder,
		width,
		height;

	this.parent._activatePlaceholder.apply(this, arguments);

	placeholder = this.m_activePlaceholder;
	width = placeholder.size.width;
	height = placeholder.size.height;
	if (width > this.m_maximum || height > this.m_maximum) {
		placeholder.hasGraphics = false;
	}
	else {
		placeholder.hasGraphics = true;
	}
};

primitives.common.CanvasGraphics.prototype.resizePlaceholder = function (placeholder, width, height) {
	var layerKey,
		layer;

	this.parent.resizePlaceholder.apply(this, arguments);

	for (layerKey in placeholder.layers) {
		if (placeholder.layers.hasOwnProperty(layerKey)) {
			layer = placeholder.layers[layerKey];
			if (layer.canvascanvas !== null) {
				layer.canvascanvas.css({
					"position": "absolute",
					"width": width + "px",
					"height": height + "px"
				});
				layer.canvascanvas.attr({
					"width": width + "px",
					"height": height + "px"
				});
			}
		}
	}
};

primitives.common.CanvasGraphics.prototype.begin = function () {
	var key,
		placeholder,
		layerKey,
		layer,
		width,
		height;
	this.parent.begin.apply(this);

	for (key in this.m_placeholders) {
		if (this.m_placeholders.hasOwnProperty(key)) {
			placeholder = this.m_placeholders[key];
			width = placeholder.size.width;
			height = placeholder.size.height;
			for (layerKey in placeholder.layers) {
				if (placeholder.layers.hasOwnProperty(layerKey)) {
					layer = placeholder.layers[layerKey];

					if (layer.canvascanvas !== null) {
						layer.canvascontext.clearRect(0, 0, width, height);
					}
				}
			}
		}
	}
};

primitives.common.Graphics.prototype._getContext = function (placeholder, layer) {
	var width = placeholder.size.width,
		height = placeholder.size.height;

	if (layer.canvascanvas === null) {
		layer.canvascanvas = jQuery('<canvas></canvas>');

		layer.canvascanvas.attr({
			"width": width + "px",
			"height": height + "px"
		});
		placeholder.activeLayer.canvas.prepend(layer.canvascanvas);
		layer.canvascontext = layer.canvascanvas[0].getContext('2d');
	}
	return layer.canvascontext;
};

primitives.common.CanvasGraphics.prototype.reset = function (arg0, arg1) {
	var placeholderName = "none",
		layerName = -1,
		placeholder,
		layer,
		width,
		height;
	switch (arguments.length) {
		case 1:
			if (typeof arg0 === "string") {
				placeholderName = arg0;
			}
			else {
				layerName = arg0;
			}
			break;
		case 2:
			placeholderName = arg0;
			layerName = arg1;
			break;
	}

	this.parent.reset.apply(this, arguments);

	placeholder = this.m_placeholders[placeholderName];
	if (placeholder !== undefined) {
		width = placeholder.size.width;
		height = placeholder.size.height;
		layer = placeholder.layers[layerName];
		if (layer !== undefined && layer.canvascanvas !== null) {
			layer.canvascontext.clearRect(0, 0, width, height);
		}
	}
};

primitives.common.CanvasGraphics.prototype.polyline = function (segments, attr) {
	var placeholder = this.m_activePlaceholder,
		layer,
		context,
		index,
		segment,
		dashes,
		step;
	if (!placeholder.hasGraphics) {
		this.parent.polyline.apply(this, arguments);
	}
	else {
		layer = placeholder.activeLayer;
		context = this._getContext(placeholder, layer);
		context.save();

		if (attr.lineWidth !== undefined && attr.borderColor !== undefined) {
			context.strokeStyle = attr.borderColor;
			context.lineWidth = attr.lineWidth;
		}
		else {
			context.lineWidth = 0;
			context.strokeStyle = "Transparent";
		}

		if (attr.lineType != null) {
		    step = Math.round(attr.lineWidth) || 1;
		    switch (attr.lineType) {
		        case 0/*primitives.common.LineType.Solid*/:
		            dashes = [];
		            break;
		        case 1/*primitives.common.LineType.Dotted*/:
		            dashes = [step, step];
		            break;
		        case 2/*primitives.common.LineType.Dashed*/:
		            dashes = [step * 5, step * 3];
		            break;
		    }

		    if (context.setLineDash !== undefined) {
		        context.setLineDash(dashes);
		    } else if (context.webkitLineDash !== undefined) {
		        context.webkitLineDash = dashes;
		    } else if (context.mozDash !== undefined) {
		        context.mozDash = dashes;
		    }
		}

		context.beginPath();
		for (index = 0; index < segments.length; index += 1) {
			segment = segments[index];
			switch (segment.segmentType) {
				case 1/*primitives.common.SegmentType.Move*/:
					context.moveTo(Math.round(segment.x) + 0.5, Math.round(segment.y) + 0.5);
					break;
				case 0/*primitives.common.SegmentType.Line*/:
					context.lineTo(Math.round(segment.x) + 0.5, Math.round(segment.y) + 0.5);
					break;
				case 4/*primitives.common.SegmentType.Dot*/:
					context.moveTo(Math.round(segment.x) + 0.5, Math.round(segment.y) + 0.5);
					context.arc(Math.round(segment.x) + 0.5, Math.round(segment.y) + 0.5, Math.round(segment.radius), 0, 2 * Math.PI, false);
					break;
				case 2/*primitives.common.SegmentType.QuadraticArc*/:
					context.quadraticCurveTo(Math.round(segment.cpX) + 0.5, Math.round(segment.cpY) + 0.5, Math.round(segment.x) + 0.5, Math.round(segment.y) + 0.5);
					break;
				case 3/*primitives.common.SegmentType.CubicArc*/:
					context.bezierCurveTo(Math.round(segment.cpX1) + 0.5,
						Math.round(segment.cpY1) + 0.5,
						Math.round(segment.cpX2) + 0.5,
						Math.round(segment.cpY2) + 0.5,
						Math.round(segment.x) + 0.5,
						Math.round(segment.y) + 0.5);
					break;
			}
		}
		if (attr.lineWidth !== undefined) {
			context.stroke();
		}
		if (attr.fillColor !== undefined) {
			context.fillStyle = attr.fillColor;
			context.globalAlpha = attr.opacity;
			context.fill();
		}
		context.restore();
	}
};
primitives.common.Element = function (arg0, arg1) {
	this.ns = null;
	this.name = null;
	this.attr = {};
	this.style = {};

	this.children = [];

	switch (arguments.length) {
		case 1:
			this.name = arg0;
			break;
		case 2:
			this.ns = arg0;
			this.name = arg1;
			break;
		default:
			break;
	}
};

primitives.common.Element.prototype.setAttribute = function (key, value) {
	this.attr[key] = value;
};

primitives.common.Element.prototype.appendChild = function (child) {
	this.children[this.children.length] = child;
};

primitives.common.Element.prototype.create = function (ie8mode) {
	var result = null,
		name,
		child,
		index;
	if (this.ns !== null) {
		result = document.createElementNS(this.ns, this.name);
	}
	else {
		result = document.createElement(this.name);
	}
	for (name in this.attr) {
		if (this.attr.hasOwnProperty(name)) {
		    if (ie8mode !== undefined) {
				result[name] = this.attr[name];
			}
			else {
				result.setAttribute(name, this.attr[name]);
			}
		}
	}
	for (name in this.style) {
		if (this.style.hasOwnProperty(name)) {
			result.style[name] = this.style[name];
		}
	}
	for (index = 0; index < this.children.length; index += 1) {
		child = this.children[index];
		if (typeof child === "string") {
			result.appendChild(document.createTextNode(child));
		}
		else {
			result.appendChild(child.create(ie8mode));
		}
	}
	return result;
};

primitives.common.Element.prototype.update = function (target, ie8mode) {
	var name,
		length,
		index,
		child,
		value;
	for (name in this.style) {
		if (this.style.hasOwnProperty(name)) {
			value = this.style[name];
			if (target.style[name] !== value) {
				target.style[name] = value;
			}
		}
	}
	for (name in this.attr) {
		if (this.attr.hasOwnProperty(name)) {
			value = this.attr[name];
			if (ie8mode !== undefined) {
			    /* if you see exception here, it may be result of following situations:
                    1. You moved chart from one DOM node to another manually, it invalidates VML graphics in IE6, IE7 modes
                    so it is impossable to reuse VML items in DOM anymore. You have to update chart with Recreate option instead of refresh.
                    2. You made changes in Polyline graphics primitive and added extra sub nodes to it, so number and type of children for shape 
                        have been changed, so sub nodes mismatch is a reason for this exception.
                */
				if (target[name] !== value) {
					target[name] = value;
				}
			}
			else {
				if (target.getAttribute(name) !== value) {
					target.setAttribute(name, value);
				}
			}
		}
	}
	length = this.children.length;
	for (index = 0; index < length; index += 1) {
		child = this.children[index];
		if (typeof child === "string") {
			if (target.innerHtml !== child) {
				target.innerHtml = child;
			}
		}
		else {
			this.children[index].update(target.children[index], ie8mode);
		}
	}
};
primitives.common.Layer = function (name) {
	this.name = name;

	this.canvas = null;

	this.canvascanvas = null;
	this.svgcanvas = null;
};
primitives.common.Placeholder = function (name) {
	this.name = name;

	this.layers = {};
	this.activeLayer = null;

	this.size = null;
	this.rect = null;

	this.div = null;

	this.hasGraphics = true;
};
primitives.common.SvgGraphics = function (widget) {
	this.parent = primitives.common.Graphics.prototype;

	this.parent.constructor.apply(this, arguments);

	this._svgxmlns = "http://www.w3.org/2000/svg";

	this.graphicsType = 0/*primitives.common.GraphicsType.SVG*/;

	this.hasGraphics = true;
};

primitives.common.SvgGraphics.prototype = new primitives.common.Graphics();

primitives.common.SvgGraphics.prototype.clean = function () {
	var key,
		placeholder,
		layerKey,
		layer;
	for (key in this.m_placeholders) {
		if (this.m_placeholders.hasOwnProperty(key)) {
			placeholder = this.m_placeholders[key];
			for (layerKey in placeholder.layers) {
				if (placeholder.layers.hasOwnProperty(layerKey)) {
					layer = placeholder.layers[layerKey];
					if (layer.svgcanvas !== null) {
						layer.svgcanvas.remove();
						layer.svgcanvas = null;
					}
				}
			}
		}
	}
	this.parent.clean.apply(this, arguments);
};

primitives.common.SvgGraphics.prototype.resizePlaceholder = function (placeholder, width, height) {
	var layerKey,
		layer,
		position;

	this.parent.resizePlaceholder.apply(this, arguments);

	for (layerKey in placeholder.layers) {
		if (placeholder.layers.hasOwnProperty(layerKey)) {
			layer = placeholder.layers[layerKey];
			if (layer.svgcanvas !== null) {
				position = {
					"position": "absolute"
					, "width": width + "px"
					, "height": height + "px"
				};
				layer.svgcanvas.css(position);
				layer.svgcanvas.attr({
					"viewBox": "0 0 " + width + " " + height
				});
			}
		}
	}
};

primitives.common.SvgGraphics.prototype._getCanvas = function () {
	var placeholder = this.m_activePlaceholder,
		layer = placeholder.activeLayer,
		panelSize = placeholder.rect;
	if (layer.svgcanvas === null) {
		layer.svgcanvas = jQuery('<svg version = "1.1"></svg>');
		layer.svgcanvas.attr({
			"viewBox": panelSize.x + " " + panelSize.y + " " + panelSize.width + " " + panelSize.height
		});
		layer.svgcanvas.css({
			"width": panelSize.width + "px",
			"height": panelSize.height + "px"
		});
		placeholder.activeLayer.canvas.prepend(layer.svgcanvas);
	}

	return layer.svgcanvas;
};

primitives.common.SvgGraphics.prototype.polyline = function (segments, attr) {
	var placeholder = this.m_activePlaceholder,
		polyline,
		data,
		index,
		segment,
		element,
		svgcanvas,
		step;


	polyline = new primitives.common.Element(this._svgxmlns, "path");
	if (attr.fillColor !== undefined) {
		polyline.setAttribute("fill", attr.fillColor);
		polyline.setAttribute("fill-opacity", attr.opacity);
	}
	else {
		polyline.setAttribute("fill-opacity", 0);
	}

	if (attr.lineWidth !== undefined && attr.borderColor !== undefined) {
		polyline.setAttribute("stroke", attr.borderColor);
		polyline.setAttribute("stroke-width", attr.lineWidth);
	} else {
		polyline.setAttribute("stroke", "transparent");
		polyline.setAttribute("stroke-width", 0);
	}

	if (attr.lineType != null) {
	    step = Math.round(attr.lineWidth) || 1;
	    switch (attr.lineType) {
	        case 0/*primitives.common.LineType.Solid*/:
	            polyline.setAttribute("stroke-dasharray", "");
	            break;
	        case 1/*primitives.common.LineType.Dotted*/:
	            polyline.setAttribute("stroke-dasharray", step + "," + step);
	            break;
	        case 2/*primitives.common.LineType.Dashed*/:
	            polyline.setAttribute("stroke-dasharray", (step * 5) + "," + (step * 3));
	            break;
	    }
	}

	data = "";
	for (index = 0; index < segments.length; index += 1) {
		segment = segments[index];
		switch (segment.segmentType) {
			case 1/*primitives.common.SegmentType.Move*/:
				data += "M" + (Math.round(segment.x) + 0.5) + " " + (Math.round(segment.y) + 0.5);
				break;
			case 0/*primitives.common.SegmentType.Line*/:
				data += "L" + (Math.round(segment.x) + 0.5) + " " + (Math.round(segment.y) + 0.5);
				break;
			case 2/*primitives.common.SegmentType.QuadraticArc*/:
				data += "Q" + (Math.round(segment.cpX) + 0.5) + " " + (Math.round(segment.cpY) + 0.5) + " " + (Math.round(segment.x) + 0.5) + " " + (Math.round(segment.y) + 0.5);
				break;
			case 4/*primitives.common.SegmentType.Dot*/:
				data += "M" + (Math.round(segment.x - segment.radius) + 0.5) + " " + (Math.round(segment.y) + 0.5);
				data += "A" + segment.radius + " " + segment.radius + " 0 1 0 " + (Math.round(segment.x + segment.radius) + 0.5) + " " + (Math.round(segment.y) + 0.5);
				data += "A" + segment.radius + " " + segment.radius + " 0 1 0 " + (Math.round(segment.x - segment.radius) + 0.5) + " " + (Math.round(segment.y) + 0.5);
				break;
			case 3/*primitives.common.SegmentType.CubicArc*/:
				data += "C" + (Math.round(segment.cpX1) + 0.5) + " " + (Math.round(segment.cpY1) + 0.5) +
					" " + (Math.round(segment.cpX2) + 0.5) + " " + (Math.round(segment.cpY2) + 0.5) +
					" " + (Math.round(segment.x) + 0.5) + " " + (Math.round(segment.y) + 0.5);
				break;
		}
	}
	polyline.setAttribute("d", data);
	element = this.m_cache.get(placeholder.name, placeholder.activeLayer.name, "path");
	if (element === null) {
		element = jQuery(polyline.create());
		svgcanvas = this._getCanvas();
		svgcanvas.append(element);
		this.m_cache.put(placeholder.name, placeholder.activeLayer.name, "path", element);
	}
	else {
		polyline.update(element[0]);
	}
};
primitives.common.Transform = function () {
	this.invertArea = false;
	this.invertHorizontally = false;
	this.invertVertically = false;

	this.size = null;
};

primitives.common.Transform.prototype.setOrientation = function (orientationType) {
    switch (orientationType) {
        case 0/*primitives.common.OrientationType.Top*/:
            this.invertArea = false;
            this.invertHorizontally = false;
            this.invertVertically = false;
            break;
        case 1/*primitives.common.OrientationType.Bottom*/:
            this.invertArea = false;
            this.invertHorizontally = false;
            this.invertVertically = true;
            break;
        case 2/*primitives.common.OrientationType.Left*/:
            this.invertArea = true;
            this.invertHorizontally = false;
            this.invertVertically = false;
            break;
        case 3/*primitives.common.OrientationType.Right*/:
            this.invertArea = true;
            this.invertHorizontally = true;
            this.invertVertically = false;
            break;
    }
};

primitives.common.Transform.prototype.transformPoint = function (x, y, forward, self, func) {
	var value;

	if (forward) {
	    if (this.invertArea) {
	        value = x;
	        x = y;
	        y = value;
	    }
	}

	if (this.invertHorizontally) {
		x = this.size.width - x;
	}
	if (this.invertVertically) {
		y = this.size.height - y;
	}

	if (!forward) {
	    if (this.invertArea) {
	        value = x;
	        x = y;
	        y = value;
	    }
	}

	func.call(self, x, y);
};

primitives.common.Transform.prototype.transformPoints = function (x, y, x2, y2, forward, self, func) {
	var value;

	if (forward) {
	    if (this.invertArea) {
	        value = x;
	        x = y;
	        y = value;
	        value = x2;
	        x2 = y2;
	        y2 = value;
	    }
	}

	if (this.invertHorizontally) {
		x = this.size.width - x;
		x2 = this.size.width - x2;
	}

	if (this.invertVertically) {
		y = this.size.height - y;
		y2 = this.size.height - y2;
	}

	if (!forward) {
	    if (this.invertArea) {
	        value = x;
	        x = y;
	        y = value;
	        value = x2;
	        x2 = y2;
	        y2 = value;
	    }
	}

	func.call(self, x, y, x2, y2);
};

primitives.common.Transform.prototype.transform3Points = function (x, y, x2, y2, x3, y3, forward, self, func) {
	var value;

	if (forward) {
	    if (this.invertArea) {
	        value = x;
	        x = y;
	        y = value;
	        value = x2;
	        x2 = y2;
	        y2 = value;
	        value = x3;
	        x3 = y3;
	        y3 = value;
	    }
	}

	if (this.invertHorizontally) {
		x = this.size.width - x;
		x2 = this.size.width - x2;
		x3 = this.size.width - x3;
	}
	if (this.invertVertically) {
		y = this.size.height - y;
		y2 = this.size.height - y2;
		y3 = this.size.height - y3;
	}

	if (!forward) {
	    if (this.invertArea) {
	        value = x;
	        x = y;
	        y = value;
	        value = x2;
	        x2 = y2;
	        y2 = value;
	        value = x3;
	        x3 = y3;
	        y3 = value;
	    }
	}

	func.call(self, x, y, x2, y2, x3, y3);
};

primitives.common.Transform.prototype.transformRect = function (x, y, width, height, forward, self, func) {
	var value;

	if (forward) {
	    if (this.invertArea) {
	        value = x;
	        x = y;
	        y = value;
	        value = width;
	        width = height;
	        height = value;
	    }
	}

	if (this.invertHorizontally) {
		x = this.size.width - x - width;
	}
	if (this.invertVertically) {
		y = this.size.height - y - height;
	}

	if (!forward) {
	    if (this.invertArea) {
	        value = x;
	        x = y;
	        y = value;
	        value = width;
	        width = height;
	        height = value;
	    }
	}

	func.call(self, x, y, width, height);
};

primitives.common.Transform.prototype.transformSegments = function (segments, forward) {
    var index, len, segment;
    for (index = 0, len = segments.length; index < len; index += 1) {
        segment = segments[index];
        switch (segment.segmentType) {
            case 2/*primitives.common.SegmentType.QuadraticArc*/:
                this.transformPoints(segment.x, segment.y, segment.cpX, segment.cpY, forward, this, function (x, y, cpX, cpY) {
                    segment.x = x;
                    segment.y = y;
                    segment.cpX = cpX;
                    segment.cpY = cpY;
                });//ignore jslint
                break;
            case 3/*primitives.common.SegmentType.CubicArc*/:
                this.transform3Points(segment.x, segment.y, segment.cpX1, segment.cpY1, segment.cpX2, segment.cpY2, forward, this, function (x, y, cpX1, cpY1, cpX2, cpY2) {
                    segment.x = x;
                    segment.y = y;
                    segment.cpX1 = cpX1;
                    segment.cpY1 = cpY1;
                    segment.cpX2 = cpX2;
                    segment.cpY2 = cpY2;
                });//ignore jslint
                break;
            case 0/*primitives.common.SegmentType.Line*/:
            case 1/*primitives.common.SegmentType.Move*/:
                this.transformPoint(segment.x, segment.y, forward, this, function (x, y) {
                    segment.x = x;
                    segment.y = y;
                });//ignore jslint
                break;
        }
    }
};
primitives.common.VmlGraphics = function (widget) {
	var vmlStyle,
		names,
		index;
	this.parent = primitives.common.Graphics.prototype;
	this.parent.constructor.apply(this, arguments);


	this.prefix = "rvml";
	this.ie8mode = (document.documentMode && document.documentMode >= 8);

	try {
		/*ignore jslint start*/
		eval('document.namespaces');
		/*ignore jslint end*/
	}
	catch (ex) {

	}

	if (!document.namespaces[this.prefix]) {
		document.namespaces.add(this.prefix, 'urn:schemas-microsoft-com:vml');
	}

	if (!primitives.common.VmlGraphics.prototype.vmlStyle) {
		vmlStyle = primitives.common.VmlGraphics.prototype.vmlStyle = document.createStyleSheet();
		names = [" *", "fill", "shape", "path", "textpath", "stroke"];
		for (index = 0; index < names.length; index += 1) {
			vmlStyle.addRule(this.prefix + "\\:" + names[index], "behavior:url(#default#VML); position:absolute;");
		}
	}

	this.graphicsType = 2/*primitives.common.GraphicsType.VML*/;
	this.hasGraphics = true;
};

primitives.common.VmlGraphics.prototype = new primitives.common.Graphics();

primitives.common.VmlGraphics.prototype.text = function (x, y, width, height, label, orientation, horizontalAlignment, verticalAlignment, attr) {
	var placeholder,
		rotateLeft,
		textRect,
		textRectCoordSize,
		line,
		path,
		lineHeight,
		textHeight,
		fromPoint,
		toPoint,
		textpath,
		element;

	switch (orientation) {
		case 0/*primitives.text.TextOrientationType.Horizontal*/:
		case 3/*primitives.text.TextOrientationType.Auto*/:
			this.parent.text.call(this, x, y, width, height, label, orientation, horizontalAlignment, verticalAlignment, attr);
			break;
		default:
			placeholder = this.m_activePlaceholder;

			rotateLeft = (orientation === 1/*primitives.text.TextOrientationType.RotateLeft*/);
			textRect = new primitives.common.Rect(x, y, width, height);
			textRectCoordSize = new primitives.common.Rect(0, 0, width * 10, height * 10);

			line = new primitives.common.Element(this.prefix + ":shape");
			line.setAttribute("CoordSize", textRectCoordSize.width + "," + textRectCoordSize.height);
			line.setAttribute("filled", true);
			line.setAttribute("stroked", false);
			line.setAttribute("fillcolor", attr["font-color"]);
			line.style.top = textRect.y + "px";
			line.style.left = textRect.x + "px";
			line.style.width = textRect.width + "px";
			line.style.height = textRect.height + "px";
			line.style['font-family'] = attr['font-family'];


			path = new primitives.common.Element(this.prefix + ":path");
			path.setAttribute("TextPathOk", true);

			lineHeight = 10 * Math.floor(this.getPxSize(attr['font-size'])) * 1.6 /* ~ line height*/;
			textHeight = lineHeight * Math.max(label.split('\n').length - 1, 1);
			fromPoint = null;
			toPoint = null;

			if (rotateLeft) {
				switch (verticalAlignment) {
					case 0/*primitives.common.VerticalAlignmentType.Top*/:
						fromPoint = new primitives.common.Point(textRectCoordSize.x + textHeight / 2.0, textRectCoordSize.bottom());
						toPoint = new primitives.common.Point(textRectCoordSize.x + textHeight / 2.0, textRectCoordSize.y);
						break;
					case 1/*primitives.common.VerticalAlignmentType.Middle*/:
						fromPoint = new primitives.common.Point(textRectCoordSize.horizontalCenter(), textRectCoordSize.bottom());
						toPoint = new primitives.common.Point(textRectCoordSize.horizontalCenter(), textRectCoordSize.y);
						break;
					case 2/*primitives.common.VerticalAlignmentType.Bottom*/:
						fromPoint = new primitives.common.Point(textRectCoordSize.right() - textHeight / 2.0, textRectCoordSize.bottom());
						toPoint = new primitives.common.Point(textRectCoordSize.right() - textHeight / 2.0, textRectCoordSize.y);
						break;
				}
			}
			else {
				switch (verticalAlignment) {
					case 0/*primitives.common.VerticalAlignmentType.Top*/:
						fromPoint = new primitives.common.Point(textRectCoordSize.right() - textHeight / 2.0, textRectCoordSize.y);
						toPoint = new primitives.common.Point(textRectCoordSize.right() - textHeight / 2.0, textRectCoordSize.bottom());
						break;
					case 1/*primitives.common.VerticalAlignmentType.Middle*/:
						fromPoint = new primitives.common.Point(textRectCoordSize.horizontalCenter(), textRectCoordSize.y);
						toPoint = new primitives.common.Point(textRectCoordSize.horizontalCenter(), textRectCoordSize.bottom());
						break;
					case 2/*primitives.common.VerticalAlignmentType.Bottom*/:
						fromPoint = new primitives.common.Point(textRectCoordSize.x + textHeight / 2.0, textRectCoordSize.y);
						toPoint = new primitives.common.Point(textRectCoordSize.x + textHeight / 2.0, textRectCoordSize.bottom());
						break;
				}
			}
			path.setAttribute("v", " m" + fromPoint.x + "," + fromPoint.y + " l" + toPoint.x + "," + toPoint.y + " e");

			textpath = new primitives.common.Element(this.prefix + ":textpath");
			textpath.setAttribute("on", true);
			textpath.setAttribute("string", label);
			textpath.style.trim = false;
			textpath.style['v-text-align'] = this._getTextAlign(horizontalAlignment);
			textpath.style['font'] = "normal normal normal " + attr['font-size'] + "pt " + attr['font-family']; //ignore jslint

			line.appendChild(path);
			line.appendChild(textpath);

			element = this.m_cache.get(placeholder.name, placeholder.activeLayer.name, "vmltext");
			if (element === null) {
				element = jQuery(line.create(this.ie8mode));
				placeholder.activeLayer.canvas.append(element);
				this.m_cache.put(placeholder.name, placeholder.activeLayer.name, "vmltext", element);
			}
			else {
				line.update(element[0], this.ie8mode);
			}
			break;
	}
};

primitives.common.VmlGraphics.prototype.polyline = function (segments, attr) {
	var placeholder = this.m_activePlaceholder,
		rect = new primitives.common.Rect(placeholder.rect),
		rectCoordSize = new primitives.common.Rect(0, 0, rect.width * 10, rect.height * 10),
		shape = new primitives.common.Element(this.prefix + ":shape"),
		data,
		segment,
		index,
		path,
        stroke,
		fill,
		element,
		x, y, x2, y2, value,
		signature;

	if (attr.borderColor !== undefined && attr.lineWidth !== undefined) {
		shape.setAttribute("strokecolor", attr.borderColor);
		shape.setAttribute("strokeweight", attr.lineWidth);
		shape.setAttribute("stroked", true);
	}
	else {
		shape.setAttribute("stroked", false);
	}
	
	shape.setAttribute("CoordSize", rectCoordSize.width + "," + rectCoordSize.height);
	shape.style.top = rect.y + "px";
	shape.style.left = rect.x + "px";
	shape.style.width = rect.width + "px";
	shape.style.height = rect.height + "px";

	data = "";
	for (index = 0; index < segments.length; index += 1) {
		segment = segments[index];
		switch (segment.segmentType) {
			case 1/*primitives.common.SegmentType.Move*/:
				data += " m" + (10 * Math.round(segment.x)) + "," + (10 * Math.round(segment.y));
				break;
			case 0/*primitives.common.SegmentType.Line*/:
				data += " l" + (10 * Math.round(segment.x)) + "," + (10 * Math.round(segment.y));
				break;
			case 4/*primitives.common.SegmentType.Dot*/:
				x = Math.round(segment.x - segment.radius);
				y = Math.round(segment.y - segment.radius);
				x2 = Math.round(segment.x + segment.radius);
				y2 = Math.round(segment.y + segment.radius);
				if (x > x2) {
					value = x;
					x = x2;
					x2 = value;
				}
				if (y > y2) {
					value = y;
					y = y2;
					y2 = value;
				}
				x = 10 * x + 5;
				y = 10 * y + 5;
				x2 = 10 * x2 - 5;
				y2 = 10 * y2 - 5;
				data += " m" + x + "," + y;
				data += " l" + x2 + "," + y;
				data += " l" + x2 + "," + y2;
				data += " l" + x + "," + y2;
				data += " l" + x + "," + y;
				break;
			case 2/*primitives.common.SegmentType.QuadraticArc*/:
				data += " qb" + (10 * Math.round(segment.cpX)) + "," + (10 * Math.round(segment.cpY)) +
					" l" + (10 * Math.round(segment.x)) + "," + (10 * Math.round(segment.y));
				break;
			case 3/*primitives.common.SegmentType.CubicArc*/:
				data += " c" + 10 * Math.round(segment.cpX1) + "," + 10 * Math.round(segment.cpY1) + "," + 10 * Math.round(segment.cpX2) + "," + 10 * Math.round(segment.cpY2) + "," + 10 * Math.round(segment.x) + "," + 10 * Math.round(segment.y); //ignore jslint
				break;
		}
	}
	data += " e";

	signature = "shapepath";
	path = new primitives.common.Element(this.prefix + ":path");
	path.setAttribute("v", data);
	shape.appendChild(path);

	if (attr.lineType != null) {
	    stroke = new primitives.common.Element(this.prefix + ":stroke");
	    switch (attr.lineType) {
	        case 0/*primitives.common.LineType.Solid*/:
	            stroke.setAttribute("dashstyle", "Solid");
	            break;
	        case 1/*primitives.common.LineType.Dotted*/:
	            stroke.setAttribute("dashstyle", "ShortDot");
	            break;
	        case 2/*primitives.common.LineType.Dashed*/:
	            stroke.setAttribute("dashstyle", "Dash");
	            break;
	    }
	    shape.appendChild(stroke);
	    signature += "stroke";
	}


	if (attr.fillColor !== null) {
		shape.setAttribute("filled", true);
		fill = new primitives.common.Element(this.prefix + ":fill");
		fill.setAttribute("opacity", attr.opacity);
		fill.setAttribute("color", attr.fillColor);
		shape.appendChild(fill);
		signature += "fill";
	}
	else {
		shape.setAttribute("filled", false);
	}

	element = this.m_cache.get(placeholder.name, placeholder.activeLayer.name, signature);
	if (element === null) {
		element = jQuery(shape.create(this.ie8mode));
		placeholder.activeLayer.canvas.append(element);
		this.m_cache.put(placeholder.name, placeholder.activeLayer.name, signature, element);
	}
	else {
		shape.update(element[0], this.ie8mode);
	}
};
/*
    Class: primitives.text.Config
	    Text options class.
	
*/
primitives.text.Config = function () {
	this.classPrefix = "bptext";

	/*
	    Property: graphicsType
			Preferable graphics type. If preferred graphics type is not supported widget switches to first available. 

		Default:
			<primitives.common.GraphicsType.SVG>
    */
	this.graphicsType = 0/*primitives.common.GraphicsType.SVG*/;

	/*
    Property: actualGraphicsType
        Actual graphics type.
    */
	this.actualGraphicsType = null;

	/*
	    Property: textDirection
			Direction style. 

		Default:
			<primitives.text.TextDirection.Auto>
    */
	this.orientation = 0/*primitives.text.TextOrientationType.Horizontal*/;

	/*
	    Property: text
			Text
    */
	this.text = "";


	/*
	    Property: verticalAlignment
			Vertical alignment. 

		Default:
			<primitives.common.VerticalAlignmentType.Center>
    */
	this.verticalAlignment = 1/*primitives.common.VerticalAlignmentType.Middle*/;

	/*
	    Property: horizontalAlignment
			Horizontal alignment. 

		Default:
			<primitives.common.HorizontalAlignmentType.Center>
    */
	this.horizontalAlignment = 0/*primitives.common.HorizontalAlignmentType.Center*/;

	/*
	    Property: fontSize
			Font size. 

		Default:
			15
    */
	this.fontSize = "16px";

	/*
	    Property: fontFamily
			Font family. 

		Default:
			"Arial"
    */
	this.fontFamily = "Arial";

	/*
	    Property: color
			Color. 

		Default:
			<primitives.common.Colors.Black>
    */
	this.color = "#000000"/*primitives.common.Colors.Black*/;

	/*
	    Property: Font weight.
			Font weight: normal | bold

		Default:
			"normal"
    */
	this.fontWeight = "normal";

	/*
    Property: Font style.
        Font style: normal | italic
        
    Default:
        "normal"
    */
	this.fontStyle = "normal";

	/*
	method: update
	    Makes full redraw of text widget contents reevaluating all options.
    */
};
primitives.text.Controller = function () {
	this.widgetEventPrefix = "bptext";

	this.options = new primitives.text.Config();

	this.m_placeholder = null;
	this.m_panelSize = null;

	this.m_graphics = null;
};

primitives.text.Controller.prototype._create = function () {
	this.element
			.addClass("ui-widget");

	this._createLayout();

	this._redraw();
};

primitives.text.Controller.prototype.destroy = function () {
	this._cleanLayout();
};

primitives.text.Controller.prototype._createLayout = function () {
	this.m_panelSize = new primitives.common.Rect(0, 0, this.element.outerWidth(), this.element.outerHeight());
		

	this.m_placeholder = jQuery('<div></div>');
	this.m_placeholder.css({
		"position": "relative",
		"overflow": "hidden",
		"top": "0px",
		"left": "0px",
		"padding": "0px",
		"margin": "0px"
	});
	this.m_placeholder.css(this.m_panelSize.getCSS());
	this.m_placeholder.addClass("placeholder");
	this.m_placeholder.addClass(this.widgetEventPrefix);

	this.element.append(this.m_placeholder);

	this.m_graphics = primitives.common.createGraphics(this.options.graphicsType, this);

	this.options.actualGraphicsType = this.m_graphics.graphicsType;
};

primitives.text.Controller.prototype._cleanLayout = function () {
	if (this.m_graphics !== null) {
		this.m_graphics.clean();
	}
	this.m_graphics = null;

	this.element.find("." + this.widgetEventPrefix).remove();
};

primitives.text.Controller.prototype._updateLayout = function () {
	this.m_panelSize = new primitives.common.Rect(0, 0, this.element.innerWidth(), this.element.innerHeight());
	this.m_placeholder.css(this.m_panelSize.getCSS());
};

primitives.text.Controller.prototype.update = function (recreate) {
	if (recreate) {
		this._cleanLayout();
		this._createLayout();
		this._redraw();
	}
	else {
		this._updateLayout();
		this.m_graphics.resize("placeholder", this.m_panelSize.width, this.m_panelSize.height);
		this.m_graphics.begin();
		this._redraw();
		this.m_graphics.end();
	}
};

primitives.text.Controller.prototype._redraw = function () {
    var panel = this.m_graphics.activate("placeholder"),
		attr = {
		    "font-size": this.options.fontSize,
		    "font-family": this.options.fontFamily,
		    "font-style": this.options.fontStyle,
		    "font-weight": this.options.fontWeight,
		    "font-color": this.options.color
		};
		this.m_graphics.text(
          panel.rect.x
        , panel.rect.y
        , panel.rect.width
        , panel.rect.height
        , this.options.text
        , this.options.orientation
        , this.options.horizontalAlignment
        , this.options.verticalAlignment
        , attr
        );
};

primitives.text.Controller.prototype._setOption = function (key, value) {
	jQuery.Widget.prototype._setOption.apply(this, arguments);

	switch (key) {
		case "disabled":
			var handles = jQuery([]);
			if (value) {
				handles.filter(".ui-state-focus").blur();
				handles.removeClass("ui-state-hover");
				handles.propAttr("disabled", true);
				this.element.addClass("ui-disabled");
			} else {
				handles.propAttr("disabled", false);
				this.element.removeClass("ui-disabled");
			}
			break;
		default:
			break;
	}
};

/*
 * jQuery UI Text
 *
 * Basic Primitives Text.
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function ($) {
    $.widget("ui.bpText", new primitives.text.Controller());
}(jQuery));
primitives.orgdiagram.BaseController = function () {
	this.graphics = null;
	this.transform = null;

    // User API items defining organizationor family chart depending on implementation
	this._treeItemConfigs = {};  /* primitives.orgdiagram.ItemConfig or primitives.famdiagram.ItemConfig */

    // Organizational chart definition 
	this._orgItems = {};  /* primitives.orgdiagram.OrgItem */
	this._orgItemChildren = {}; /* key: primitives.orgdiagram.OrgItem.id value: array of primitives.orgdiagram.OrgItem.id having  OrgItem.parent equal to key */
	this._orgItemRoots = []; // primitives.orgdiagram.OrgItem

	this._orgPartners = {}; /* key: primitives.orgdiagram.OrgItem.id value: array of primitives.orgdiagram.OrgItem.id */

    // Visual tree definition
	this._treeItems = {}; /* key: primitives.orgdiagram.TreeItem.id value:primitives.orgdiagram.TreeItem */
	this._treeItemCounter = 0; /* counter of primitives.orgdiagram.TreeItem.id*/
	this._treeItemsByUserId = {}; /* key: ItemConfig.id value:primitives.orgdiagram.TreeItem */

    this._treeLevels = []; /* array of primitives.orgdiagram.TreeLevel */
	this._leftMargins = {};
	this._rightMargins = {};

	this._templates = {};
	this._defaultTemplate = null;

	this._checkBoxTemplate = null;
	this._checkBoxTemplateHashCode = null;

	this._buttonsTemplate = null;
	this._buttonsTemplateHashCode = null;

	this._groupTitleTemplate = null;
	this._groupTitleTemplateHashCode = null;

	this._annotationLabelTemplate = null;
	this._annotationLabelTemplateHashCode = null;

	this._cursorTreeItem = null; /* primitives.orgdiagram.TreeItem */
	this._highlightTreeItem = null; /* primitives.orgdiagram.TreeItem */

	this.m_scrollPanel = null;
	this.m_scrollPanelRect = new primitives.common.Rect(0, 0, 0, 0);
	this.m_placeholder = null;
	this.m_placeholderRect = new primitives.common.Rect(0, 0, 0, 0);

	this.m_calloutPlaceholder = null;
	this.m_calloutShape = null;

	this.boxModel = jQuery.support.boxModel;

	this._cancelMouseClick = false;

	this._itemsInterval = [];

	this._scale = null; // on zoom start scale value
	this.scale = 1; // current scale value

	this.showInvisibleSubTrees = false;
	this.showElbowDots = false;
};

primitives.orgdiagram.BaseController.prototype._create = function () {
	this.element
			.addClass("ui-widget");

	this._createLayout();

	this._bind();

	this.graphics = null;
	this.transform = null;

	this._redraw();
};

primitives.orgdiagram.BaseController.prototype.destroy = function () {
    this._unbind();

	this._clean();

	this._cleanLayout();
};

primitives.orgdiagram.BaseController.prototype._clean = function () {
	if (this.graphics !== null) {
		this.graphics.clean();
	}
	this.graphics = null;
	this.transform = null;
};

primitives.orgdiagram.BaseController.prototype._cleanLayout = function () {
	if (this.options.enablePanning) {
		this._mouseDestroy();
	}

	this.element.find("." + this.widgetEventPrefix).remove();
};

primitives.orgdiagram.BaseController.prototype._createLayout = function () {
	this.m_scrollPanelRect = new primitives.common.Rect(0, 0, this.element.outerWidth(), this.element.outerHeight());
	this.m_placeholderRect = new primitives.common.Rect(this.m_scrollPanelRect);

	var position = this.element.offset();

	this.m_scrollPanel = jQuery('<div></div>');
	this.m_scrollPanel.css({
		"position": "relative",
		"overflow": "auto",
		"top": "0px",
		"left": "0px",
		"width": this.m_scrollPanelRect.width + "px",
		"height": this.m_scrollPanelRect.height + "px",
		"padding": "0px",
		"margin-bottom": "0px",
		"margin-right": "0px",
		"margin-top": (-position.top + Math.floor(position.top)) + "px", /* fixes div pixel alignment */
		"margin-left": (-position.left + Math.floor(position.left)) + "px",
		"-webkit-overflow-scrolling": "touch"
	});
	this.m_scrollPanel.addClass(this.widgetEventPrefix);

	this.m_placeholder = jQuery('<div></div>');
	this.m_placeholder.css({
		position: "absolute",
		overflow: "hidden",
		top: "0px",
		left: "0px"
	});
	this.m_placeholder.addClass("placeholder");
	this.m_placeholder.addClass(this.widgetEventPrefix);
	this.m_placeholder.css(this.m_placeholderRect.getCSS());
	this.m_scrollPanel.append(this.m_placeholder);

	this.m_calloutPlaceholder = jQuery('<div></div>');
	this.m_calloutPlaceholder.css({
		position: "absolute",
		overflow: "visible"
	});
	this.m_calloutPlaceholder.addClass("calloutplaceholder");
	this.m_calloutPlaceholder.addClass(this.widgetEventPrefix);
	this.m_calloutPlaceholder.css({
		top: "0px",
		left: "0px",
		width: "0px",
		height: "0px"
	});
	this.m_placeholder.append(this.m_calloutPlaceholder);

	this.element.append(this.m_scrollPanel);
	
	if (this.options.enablePanning) {
		this._mouseInit(this.m_placeholder);
	}
};

primitives.orgdiagram.BaseController.prototype._updateLayout = function () {
	var position = this.element.offset();
	this.m_scrollPanelRect = new primitives.common.Rect(0, 0, this.element.outerWidth(), this.element.outerHeight());
	this.m_scrollPanel.css({
		"top": "0px",
		"left": "0px",
		"width": this.m_scrollPanelRect.width + "px",
		"height": this.m_scrollPanelRect.height + "px",
		"margin-bottom": "0px",
		"margin-right": "0px",
		"margin-top": (-position.top + Math.floor(position.top)) + "px",
		"margin-left": (-position.left + Math.floor(position.left)) + "px"
	});
};

primitives.orgdiagram.BaseController.prototype._bind = function () {
	var self = this;

	this.m_placeholder
		.mousemove(function (e) { self._onMouseMove(e); })
        .click(function (e) { self._onMouseClick(e); });

	if ('ontouchstart' in document.documentElement) {//ignore jslint
		this.m_scrollPanel[0].addEventListener("gesturestart", self.onGestureStartHandler = function (event) { self.onGestureStart(event); }, false);
		this.m_scrollPanel[0].addEventListener("gesturechange", self.onGestureChangeHandler = function (event) { self.onGestureChange(event); }, false);
	}

	this.options.onDefaultTemplateRender = function (event, data) { self._onDefaultTemplateRender(event, data); };
	this.options.onCheckBoxTemplateRender = function (event, data) { self._onCheckBoxTemplateRender(event, data); };
	this.options.onGroupTitleTemplateRender = function (event, data) { self._onGroupTitleTemplateRender(event, data); };
	this.options.onButtonsTemplateRender = function (event, data) { self._onButtonsTemplateRender(event, data); };
	this.options.onAnnotationLabelTemplateRender = function (event, data) { self._onAnnotationLabelTemplateRender(event, data); };
};

primitives.orgdiagram.BaseController.prototype._unbind = function () {
	this.m_placeholder.unbind("mousemove");
	this.m_placeholder.unbind("click");

	if ('ontouchstart' in document.documentElement) {//ignore jslint
		this.m_scrollPanel[0].removeEventListener("gesturestart", this.onGestureStartHandler, false);
		this.m_scrollPanel[0].removeEventListener("mousewheel", this.onGestureChangeHandler, false);
	}

	this.options.onDefaultTemplateRender = null;
	this.options.onCheckBoxTemplateRender = null;
};

primitives.orgdiagram.BaseController.prototype.update = function (updateMode) {
	switch (updateMode) {
		case 2/*primitives.common.UpdateMode.PositonHighlight*/:
			this._redrawHighlight();
			break;
		case 1/*primitives.common.UpdateMode.Refresh*/:
			this._refresh();
			break;
		default:
			this._redraw();
			break;
	}
};

primitives.orgdiagram.BaseController.prototype._mouseCapture = function (event) {
	this._dragStartPosition = new primitives.common.Point(this.m_scrollPanel.scrollLeft() + event.pageX, this.m_scrollPanel.scrollTop() + event.pageY);
    return true;
};

primitives.orgdiagram.BaseController.prototype._mouseDrag = function (event) {
    var position = new primitives.common.Point(event.pageX, event.pageY),
		left = - position.x + this._dragStartPosition.x,
		top = - position.y + this._dragStartPosition.y;
    this.m_scrollPanel.css('visibility', 'hidden');
    this.m_scrollPanel
        .scrollLeft(left)
        .scrollTop(top);
    this.m_scrollPanel.css('visibility', 'inherit');
    return false;
};

primitives.orgdiagram.BaseController.prototype._mouseStop = function (event) {//ignore jslint
	this._cancelMouseClick = true;
};

/* This is virtual method. It is overriten in orgDiagram & in famDiagram */
primitives.orgdiagram.BaseController.prototype._getEventArgs = function (oldTreeItem, newTreeItem, name) {
    return null;
};

primitives.orgdiagram.BaseController.prototype._onMouseMove = function (event) {
    var placeholderOffset = this.m_placeholder.offset(),
		m_placeholderLeft = placeholderOffset.left,
		m_placeholderTop = placeholderOffset.top,
		x = event.pageX - m_placeholderLeft,
		y = event.pageY - m_placeholderTop,
		newCursorItem,
		eventArgs;

	if (!this._mouseStarted) {
		this._cancelMouseClick = false;
		newCursorItem = this._getTreeItemForMousePosition(x, y);
		if ('ontouchstart' in document.documentElement) {//ignore jslint
			this._highlightTreeItem = newCursorItem;
		} else {
			if (newCursorItem !== null) {
			    if (newCursorItem.itemConfig.id !== this.options.highlightItem) {
			        eventArgs = this._getEventArgs(this._highlightTreeItem, newCursorItem);

					this._highlightTreeItem = newCursorItem;
                    this.options.highlightItem = newCursorItem.itemConfig.id;

					this._trigger("onHighlightChanging", event, eventArgs);

					if (!eventArgs.cancel) {
						this._refreshHighlight();

						this._trigger("onHighlightChanged", event, eventArgs);
					}
				}
			}
			else {
				if (this.options.highlightItem !== null) {
					eventArgs = this._getEventArgs(this._highlightTreeItem, null);

					this._highlightTreeItem = null;
					this.options.highlightItem = null;

					this._trigger("onHighlightChanging", event, eventArgs);

					if (!eventArgs.cancel) {
						this._refreshHighlight();

						this._trigger("onHighlightChanged", event, eventArgs);
					}
				}
			}
		}
	}
};

primitives.orgdiagram.BaseController.prototype._onMouseClick = function (event) {
	var newCursorItem = this._highlightTreeItem,
		target,
		button,
		buttonname,
		eventArgs,
		position;

	if (newCursorItem !== null) {
		if (!this._cancelMouseClick) {
			target = jQuery(event.target);
			if (target.hasClass(this.widgetEventPrefix + "button") || target.parent("." + this.widgetEventPrefix + "button").length > 0) {
				button = target.hasClass(this.widgetEventPrefix + "button") ? target : target.parent("." + this.widgetEventPrefix + "button");
				buttonname = button.data("buttonname");

				eventArgs = this._getEventArgs(null, newCursorItem, buttonname);
				this._trigger("onButtonClick", event, eventArgs);
			}
			else if (target.attr("name") === "selectiontext") {
			}
			else if (target.attr("name") === "checkbox") {//ignore jslint
			    eventArgs = this._getEventArgs(null, newCursorItem, buttonname);
			    this._trigger("onSelectionChanging", event, eventArgs);

			    position = primitives.common.indexOf(this.options.selectedItems, newCursorItem.itemConfig.id);
				if (position >= 0) {
					this.options.selectedItems.splice(position, 1);
				}
				else {
					this.options.selectedItems.push(newCursorItem.itemConfig.id);
				}
				this._trigger("onSelectionChanged", event, eventArgs);
			}
			else {
			    eventArgs = this._getEventArgs(null, newCursorItem);

				this._trigger("onMouseClick", event, eventArgs);
				if (!eventArgs.cancel) {
				    if (newCursorItem.itemConfig.id !== this.options.cursorItem) {
				        eventArgs = this._getEventArgs(this.options.cursorItem != null ? this._treeItemsByUserId[this.options.cursorItem] : null, newCursorItem);

						this.options.cursorItem = newCursorItem.itemConfig.id;

						this._trigger("onCursorChanging", event, eventArgs);

						if (!eventArgs.cancel) {
							this._refresh();

							this._trigger("onCursorChanged", event, eventArgs);
						}
					}
				}
			}
		}
	}
	this._cancelMouseClick = false;
};

primitives.orgdiagram.BaseController.prototype.onGestureStart = function (e) {
	this._scale = this.scale;
	e.preventDefault();
};

primitives.orgdiagram.BaseController.prototype.onGestureChange = function (e) {
	var scale = Math.round(this._scale * e.scale * 10.0) / 10.0;
	if (scale > this.options.maximumScale) {
		scale = this.options.maximumScale;
	} else if (scale < this.options.minimumScale) {
		scale = this.options.minimumScale;
	}
	
	this.scale = scale;

	this._refresh();

	e.preventDefault();
};

primitives.orgdiagram.BaseController.prototype._updateScale = function () {
	var scaletext = "scale(" + this.scale + "," + this.scale + ")";

	this.m_placeholder.css({
		"transform-origin": "0 0",
		"transform": scaletext,
		"-ms-transform": scaletext, /* IE 9 */
		"-webkit-transform": scaletext, /* Safari and Chrome */
		"-o-transform": scaletext, /* Opera */
		"-moz-transform": scaletext /* Firefox */
	});
};

primitives.orgdiagram.BaseController.prototype._redraw = function () {
	this._clean();

	this.graphics = primitives.common.createGraphics(this.options.graphicsType, this);
	this.transform = new primitives.common.Transform();

	this.options.actualGraphicsType = this.graphics.graphicsType;

	this.m_calloutShape = new primitives.common.Callout(this.graphics);

	this._readTemplates();

	this._createCheckBoxTemplate();
	this._createButtonsTemplate();
	this._createGroupTitleTemplate();
	this._createAnnotationLabelTemplate();

	this._refresh();
};

primitives.orgdiagram.BaseController.prototype._refresh = function () {
	this._updateLayout();

	this.m_scrollPanel.css({
		"display": "none",
		"-webkit-overflow-scrolling": "auto"
	});

	this._updateScale();

	this._setItemsIntervals();

    /*  this is vritual method it is overriden in org and family charts differently
        create _orgItems collection defining internal org chart tree 
        in case of org chart it is straight forward conversion of user items into org items
        in case of famaly chart procedure has multiple transformation steps
        see derivatives.
    */
	this._createOrgTree();
    /* create _treeItems collection defining visual tree of the chart*/
	this._createVisualTree();
    /* position visual tree items */
	this._positionTreeItems();

	this.graphics.resize("placeholder", this.m_placeholderRect.width, this.m_placeholderRect.height);
	this.transform.size = new primitives.common.Size(this.m_placeholderRect.width, this.m_placeholderRect.height);
	this.graphics.begin();

	this._redrawTreeItems();
	this._tracePathAnnotations();
	this._redrawConnectors();
	this._drawAnnotations();
	this._drawHighlight();
	this._hideHighlightAnnotation();
	this._drawCursor();


	this.graphics.end();

	this.m_scrollPanel.css({
		"display": "block"
	});
	this._centerOnCursor();

	this.m_scrollPanel.css({
		"-webkit-overflow-scrolling": "touch"
	});
};

primitives.orgdiagram.BaseController.prototype._setItemsIntervals = function () {
	this._itemsInterval[1/*primitives.common.Visibility.Normal*/] = this.options.normalItemsInterval;
	this._itemsInterval[2/*primitives.common.Visibility.Dot*/] = this.options.dotItemsInterval;
	this._itemsInterval[3/*primitives.common.Visibility.Line*/] = this.options.lineItemsInterval;
	this._itemsInterval[4/*primitives.common.Visibility.Invisible*/] = this.options.lineItemsInterval;
};

primitives.orgdiagram.BaseController.prototype._redrawHighlight = function () {
	if (this._treeItemsByUserId[this.options.highlightItem] != null) {
	    this._highlightTreeItem = this._treeItemsByUserId[this.options.highlightItem];
	}
	this._refreshHighlight();
};

primitives.orgdiagram.BaseController.prototype._refreshHighlight = function () {
	this.graphics.reset("placeholder", 3/*primitives.common.Layers.Highlight*/);
	this.graphics.reset("calloutplaceholder", 9/*primitives.common.Layers.Annotation*/);
	this._drawHighlight();
	this._drawHighlightAnnotation();
};

primitives.orgdiagram.BaseController.prototype._drawHighlight = function () {
	var panel,
		actualPosition,
		position,
		highlightPadding,
		uiHash,
		element;
	if (this._highlightTreeItem !== null) {
		panel = this.graphics.activate("placeholder", 3/*primitives.common.Layers.Highlight*/);

		actualPosition = this._highlightTreeItem.actualPosition;
		position = new primitives.common.Rect(0, 0, this._highlightTreeItem.actualSize.width, this._highlightTreeItem.actualSize.height);
		highlightPadding = this._highlightTreeItem.template.highlightPadding;
		position.offset(highlightPadding.left, highlightPadding.top, highlightPadding.right, highlightPadding.bottom);

		uiHash = new primitives.common.RenderEventArgs();
		uiHash.context = this._highlightTreeItem.itemConfig;
		uiHash.isCursor = this._highlightTreeItem.isCursor;
		uiHash.isSelected = this._highlightTreeItem.isSelected;
		uiHash.templateName = this._highlightTreeItem.template.name;

		this.transform.transformRect(actualPosition.x, actualPosition.y, actualPosition.width, actualPosition.height, true,
			this, function (x, y, width, height) {
				element = this.graphics.template(
					  x
					, y
					, width
					, height
					, position.x
					, position.y
					, position.width
					, position.height
					, this._highlightTreeItem.template.highlightTemplate
					, this._highlightTreeItem.template.highlightTemplateHashCode
					, this._highlightTreeItem.template.highlightTemplateRenderName
					, uiHash
					, { "border-width": this._highlightTreeItem.template.highlightBorderWidth }
					);
			});
	}
};

primitives.orgdiagram.BaseController.prototype._drawCursor = function () {
	var panel,
		treeItem = this._cursorTreeItem,
		actualPosition,
		position,
		cursorPadding,
		uiHash,
		element;
	if (treeItem !== null && treeItem.actualVisibility == 1/*primitives.common.Visibility.Normal*/) {
		panel = this.graphics.activate("placeholder", 6/*primitives.common.Layers.Cursor*/);

		actualPosition = treeItem.actualPosition;
		position = new primitives.common.Rect(treeItem.contentPosition);
		cursorPadding = treeItem.template.cursorPadding;
		position.offset(cursorPadding.left, cursorPadding.top, cursorPadding.right, cursorPadding.bottom);

		uiHash = new primitives.common.RenderEventArgs();
		uiHash.context = treeItem.itemConfig;
		uiHash.isCursor = treeItem.isCursor;
		uiHash.isSelected = treeItem.isSelected;
		uiHash.templateName = treeItem.template.name;

		this.transform.transformRect(actualPosition.x, actualPosition.y, actualPosition.width, actualPosition.height, true,
			this, function (x, y, width, height) {
				element = this.graphics.template(
					  x
					, y
					, width
					, height
					, position.x
					, position.y
					, position.width
					, position.height
					, treeItem.template.cursorTemplate
					, treeItem.template.cursorTemplateHashCode
					, treeItem.template.cursorTemplateRenderName
					, uiHash
					, { "border-width": treeItem.template.cursorBorderWidth }
					);
			});
	}
};



primitives.orgdiagram.BaseController.prototype._redrawTreeItems = function () {
	var treeItem,
		orgItem,
		treeLevel,
		uiHash,
		element,
		itemTitleColor,
		attr,
		treeItemId,
		markers = {},
		segments,
		index,
		len,
		label;

	this.transform.setOrientation(this.options.orientationType);

	for (index = 0, len = this._treeLevels.length; index < len; index += 1) {
		treeLevel = this._treeLevels[index];
		treeLevel.labels = [];
		treeLevel.labelsRect = null;
		treeLevel.hasFixedLabels = false;
		treeLevel.showLabels = true;
	}

	for (treeItemId in this._treeItems) {
		if (this._treeItems.hasOwnProperty(treeItemId)) {
			treeItem = this._treeItems[treeItemId];
			orgItem = treeItem.orgItem;
			treeLevel = this._treeLevels[treeItem.level];

			treeItem.setActualPosition(treeLevel, this.options);

			this.transform.transformRect(treeItem.actualPosition.x, treeItem.actualPosition.y, treeItem.actualPosition.width, treeItem.actualPosition.height, true,
				this, function (x, y, width, height) {

					switch (treeItem.actualVisibility) {
						case 1/*primitives.common.Visibility.Normal*/:
							uiHash = new primitives.common.RenderEventArgs();
							uiHash.context = treeItem.itemConfig;
							uiHash.isCursor = treeItem.isCursor;
							uiHash.isSelected = treeItem.isSelected;
							uiHash.templateName = treeItem.template.name;

							this.graphics.activate("placeholder", 7/*primitives.common.Layers.Item*/);
							element = this.graphics.template(
									  x
									, y
									, width
									, height
									, treeItem.contentPosition.x
									, treeItem.contentPosition.y
									, treeItem.contentPosition.width
									, treeItem.contentPosition.height
									, treeItem.template.itemTemplate
									, treeItem.template.itemTemplateHashCode
									, treeItem.template.itemTemplateRenderName
									, uiHash
									, { "border-width": treeItem.template.itemBorderWidth }
									);

							if (treeItem.actualHasGroupTitle) {
								element = this.graphics.template(
										  x
										, y
										, width
										, height
										, 2
										, treeItem.contentPosition.y
										, this.options.groupTitlePanelSize - 4
										, treeItem.contentPosition.height
										, this._groupTitleTemplate
										, this._groupTitleTemplateHashCode
										, "onGroupTitleTemplateRender"
										, treeItem
										, null
										);
							}
							if (treeItem.actualHasSelectorCheckbox) {
							    this.graphics.activate("placeholder", 10/*primitives.common.Layers.Controls*/);
								element = this.graphics.template(
										  x
										, y
										, width
										, height
										, treeItem.contentPosition.x
										, treeItem.actualSize.height - (this.options.checkBoxPanelSize - 4)
										, treeItem.contentPosition.width
										, this.options.checkBoxPanelSize - 4
										, this._checkBoxTemplate
										, this._checkBoxTemplateHashCode
										, "onCheckBoxTemplateRender"
										, treeItem
										, null
										);
							}
							if (treeItem.actualHasButtons) {
							    this.graphics.activate("placeholder", 10/*primitives.common.Layers.Controls*/);
								element = this.graphics.template(
										  x
										, y
										, width
										, height
										, treeItem.actualSize.width - (this.options.buttonsPanelSize - 4)
										, treeItem.contentPosition.y
										, this.options.buttonsPanelSize - 4
										, Math.max(treeItem.contentPosition.height, treeItem.actualSize.height - treeItem.contentPosition.y)
										, this._buttonsTemplate
										, this._buttonsTemplateHashCode
										, "onButtonsTemplateRender"
										, treeItem
										, null
										);
							}

							if (this.options.showLabels == 0/*primitives.common.Enabled.Auto*/) {
								// Don't allow dot's labels overlap normal items
								label = new primitives.common.Label();
								label.text = orgItem.title;
								label.position = new primitives.common.Rect(x, y, width, height);
								label.weight = 10000;
								label.labelType = 1/*primitives.common.LabelType.Dummy*/;
								treeLevel.labels.push(label);
							}
							label = this._createLabel(x, y, width, height, treeItem);
							if (label != null) {
								treeLevel.labels.push(label);
							}
							break;
						case 2/*primitives.common.Visibility.Dot*/:
						    itemTitleColor = orgItem.itemTitleColor;
							if (itemTitleColor == null) {
								itemTitleColor = "#000080"/*primitives.common.Colors.Navy*/;
							}
							if (!markers.hasOwnProperty(itemTitleColor)) {
								markers[itemTitleColor] = [];
							}
							segments = markers[itemTitleColor];
							segments.push(new primitives.common.DotSegment(x + width / 2.0, y + height / 2.0, width / 2.0));

							label = this._createLabel(x, y, width, height, treeItem);
							if (label != null) {
								treeLevel.labels.push(label);
							}
							break;
					}
				});//ignore jslint
		}
	}

	this.graphics.activate("placeholder", 4/*primitives.common.Layers.Marker*/);
	for (itemTitleColor in markers) {
		if (markers.hasOwnProperty(itemTitleColor)) {
			segments = markers[itemTitleColor];
			attr = {
				"fillColor": itemTitleColor,
				"opacity": 1
			};
			this.graphics.polyline(segments, attr);
		}
	}

	this._redrawLabels();
};

primitives.orgdiagram.BaseController.prototype._redrawLabels = function () {
	var labels, label, label2,
		index, index2, len,
		levelIndex, levelsLen,
		attr,
		treeLevel, treeLevelFirst, treeLevelSecond;

	if (this.options.showLabels == 0/*primitives.common.Enabled.Auto*/) {
		// Calculate total labels space
		for (levelIndex = 0, levelsLen = this._treeLevels.length; levelIndex < levelsLen; levelIndex += 1) {
			treeLevel = this._treeLevels[levelIndex];
			labels = treeLevel.labels;

			for (index = 0, len = labels.length; index < len; index += 1) {
				label = labels[index];
				if (treeLevel.labelsRect == null) {
					treeLevel.labelsRect = new primitives.common.Rect(label.position);
				} else {
					treeLevel.labelsRect.addRect(label.position);
				}
				treeLevel.hasFixedLabels = treeLevel.hasFixedLabels || (label.labelType == 2/*primitives.common.LabelType.Fixed*/);
			}
		}

		// Hide overlapping rows
		for (levelIndex = this._treeLevels.length - 1; levelIndex > 0; levelIndex -= 1) {
			treeLevelFirst = this._treeLevels[levelIndex - 1];
			treeLevelSecond = this._treeLevels[levelIndex];

			if (treeLevelFirst.labelsRect != null && treeLevelSecond.labelsRect != null) {
				if (treeLevelFirst.labelsRect.overlaps(treeLevelSecond.labelsRect)) {
					treeLevelSecond.showLabels = false;
				}
			}
		}

		// Hide overlapping labels in non-hidden rows
		for (levelIndex = 0, levelsLen = this._treeLevels.length; levelIndex < levelsLen; levelIndex += 1) {
			treeLevel = this._treeLevels[levelIndex];
			labels = treeLevel.labels;

			if (treeLevel.showLabels) {
				for (index = 0, len = labels.length; index < len; index += 1) {
					label = labels[index];
					if (label.isActive) {
						for (index2 = index + 1; index2 < len; index2 += 1) {
							label2 = labels[index2];
							if (label2.isActive) {
								if (label.position.overlaps(label2.position)) {
									if (label.weight >= label2.weight) {
										if (label2.labelType == 0/*primitives.common.LabelType.Regular*/) {
											label2.isActive = false;
										}
									} else {
										if (label.labelType == 0/*primitives.common.LabelType.Regular*/) {
											label.isActive = false;
										}
										break;
									}
								} else {
									break;
								}
							}
						}
					}
				}
			}
		}
	}

	this.graphics.activate("placeholder", 5/*primitives.common.Layers.Label*/);
	attr = {
		"font-size": this.options.labelFontSize,
		"font-family": this.options.labelFontFamily,
		"font-style": this.options.labelFontStyle,
		"font-weight": this.options.labelFontWeight,
		"font-color": this.options.labelColor
	};
	for (levelIndex = 0, levelsLen = this._treeLevels.length; levelIndex < levelsLen; levelIndex += 1) {
		treeLevel = this._treeLevels[levelIndex];
		if (treeLevel.showLabels || treeLevel.hasFixedLabels) {
			labels = treeLevel.labels;
			for (index = 0, len = labels.length; index < len; index += 1) {
				label = labels[index];
				if (label.isActive) {
					switch (label.labelType) {
						case 0/*primitives.common.LabelType.Regular*/:
						case 2/*primitives.common.LabelType.Fixed*/:
							this.graphics.text(label.position.x, label.position.y, label.position.width, label.position.height, label.text,
								label.labelOrientation,
								label.horizontalAlignmentType,
								label.verticalAlignmentType,
								attr);
							break;
					}
				}
			}
		}
	}
};

primitives.orgdiagram.BaseController.prototype._createLabel = function (x, y, width, height, treeItem) {
	var labelWidth,
		labelHeight,
		result = null,
		labelOffset = this.options.labelOffset,
		labelSize,
		labelPlacement,
		orgItem = treeItem.orgItem;

	if (!primitives.common.isNullOrEmpty(orgItem.label)) {
	    switch (orgItem.showLabel) {
			case 0/*primitives.common.Enabled.Auto*/:
				switch(this.options.showLabels) {
					case 0/*primitives.common.Enabled.Auto*/:
						switch (treeItem.actualVisibility) {
							case 3/*primitives.common.Visibility.Line*/:
							case 2/*primitives.common.Visibility.Dot*/:
								result = new primitives.common.Label();
								result.labelType = 0/*primitives.common.LabelType.Regular*/;
								result.weight = treeItem.leftPadding + treeItem.rightPadding;
								break;
							default:
								break;
						}
						break;
					case 2/*primitives.common.Enabled.False*/:
						break;
					case 1/*primitives.common.Enabled.True*/:
						result = new primitives.common.Label();
						result.labelType = 2/*primitives.common.LabelType.Fixed*/;
						result.weight = 10000;
						break;
				}
				break;
			case 2/*primitives.common.Enabled.False*/:
				break;
			case 1/*primitives.common.Enabled.True*/:
				result = new primitives.common.Label();
				result.weight = 10000;
				result.labelType = 2/*primitives.common.LabelType.Fixed*/;
				break;
		}

		if (result != null) {
		    result.text = orgItem.label;
			
		    labelSize = (orgItem.labelSize != null) ? orgItem.labelSize : this.options.labelSize;
		    result.labelOrientation = (orgItem.labelOrientation != 3/*primitives.text.TextOrientationType.Auto*/) ? orgItem.labelOrientation :
				(this.options.labelOrientation != 3/*primitives.text.TextOrientationType.Auto*/) ? this.options.labelOrientation :
					0/*primitives.text.TextOrientationType.Horizontal*/;
		    labelPlacement = (orgItem.labelPlacement != 0/*primitives.common.PlacementType.Auto*/) ? orgItem.labelPlacement :
				(this.options.labelPlacement != 0/*primitives.common.PlacementType.Auto*/) ? this.options.labelPlacement :
				1/*primitives.common.PlacementType.Top*/;

			switch (result.labelOrientation) {
				case 0/*primitives.text.TextOrientationType.Horizontal*/:
					labelWidth = labelSize.width;
					labelHeight = labelSize.height;
					break;
				case 1/*primitives.text.TextOrientationType.RotateLeft*/:
				case 2/*primitives.text.TextOrientationType.RotateRight*/:
					labelHeight = labelSize.width;
					labelWidth = labelSize.height;
					break;
			}

			switch (labelPlacement) {
				case 0/*primitives.common.PlacementType.Auto*/:
				case 1/*primitives.common.PlacementType.Top*/:
					result.position = new primitives.common.Rect(x + width / 2.0 - labelWidth / 2.0, y - labelOffset - labelHeight, labelWidth, labelHeight);
					switch (result.labelOrientation) {
						case 0/*primitives.text.TextOrientationType.Horizontal*/:
							result.horizontalAlignmentType = 0/*primitives.common.HorizontalAlignmentType.Center*/;
							result.verticalAlignmentType = 2/*primitives.common.VerticalAlignmentType.Bottom*/;
							break;
						case 1/*primitives.text.TextOrientationType.RotateLeft*/:
							result.horizontalAlignmentType = 1/*primitives.common.HorizontalAlignmentType.Left*/;
							result.verticalAlignmentType = 1/*primitives.common.VerticalAlignmentType.Middle*/;
							break;
						case 2/*primitives.text.TextOrientationType.RotateRight*/:
							result.horizontalAlignmentType = 2/*primitives.common.HorizontalAlignmentType.Right*/;
							result.verticalAlignmentType = 1/*primitives.common.VerticalAlignmentType.Middle*/;
							break;
					}
					break;
			    case 2/*primitives.common.PlacementType.TopRight*/:
			    case 11/*primitives.common.PlacementType.RightTop*/:
					result.position = new primitives.common.Rect(x + width + labelOffset, y - labelOffset - labelHeight, labelWidth, labelHeight);
					switch (result.labelOrientation) {
						case 0/*primitives.text.TextOrientationType.Horizontal*/:
							result.horizontalAlignmentType = 1/*primitives.common.HorizontalAlignmentType.Left*/;
							result.verticalAlignmentType = 2/*primitives.common.VerticalAlignmentType.Bottom*/;
							break;
						case 1/*primitives.text.TextOrientationType.RotateLeft*/:
							result.horizontalAlignmentType = 1/*primitives.common.HorizontalAlignmentType.Left*/;
							result.verticalAlignmentType = 0/*primitives.common.VerticalAlignmentType.Top*/;
							break;
						case 2/*primitives.text.TextOrientationType.RotateRight*/:
							result.horizontalAlignmentType = 2/*primitives.common.HorizontalAlignmentType.Right*/;
							result.verticalAlignmentType = 2/*primitives.common.VerticalAlignmentType.Bottom*/;
							break;
					}
					break;
				case 3/*primitives.common.PlacementType.Right*/:
					result.position = new primitives.common.Rect(x + width + labelOffset, y + height / 2.0 - labelHeight / 2.0, labelWidth, labelHeight);
					switch (result.labelOrientation) {
						case 0/*primitives.text.TextOrientationType.Horizontal*/:
							result.horizontalAlignmentType = 1/*primitives.common.HorizontalAlignmentType.Left*/;
							result.verticalAlignmentType = 1/*primitives.common.VerticalAlignmentType.Middle*/;
							break;
						case 1/*primitives.text.TextOrientationType.RotateLeft*/:
							result.horizontalAlignmentType = 0/*primitives.common.HorizontalAlignmentType.Center*/;
							result.verticalAlignmentType = 0/*primitives.common.VerticalAlignmentType.Top*/;
							break;
						case 2/*primitives.text.TextOrientationType.RotateRight*/:
							result.horizontalAlignmentType = 0/*primitives.common.HorizontalAlignmentType.Center*/;
							result.verticalAlignmentType = 2/*primitives.common.VerticalAlignmentType.Bottom*/;
							break;
					}
					break;
			    case 4/*primitives.common.PlacementType.BottomRight*/:
			    case 12/*primitives.common.PlacementType.RightBottom*/:
					result.position = new primitives.common.Rect(x + width + labelOffset, y + height + labelOffset, labelWidth, labelHeight);
					switch (result.labelOrientation) {
						case 0/*primitives.text.TextOrientationType.Horizontal*/:
							result.horizontalAlignmentType = 1/*primitives.common.HorizontalAlignmentType.Left*/;
							result.verticalAlignmentType = 0/*primitives.common.VerticalAlignmentType.Top*/;
							break;
						case 1/*primitives.text.TextOrientationType.RotateLeft*/:
							result.horizontalAlignmentType = 2/*primitives.common.HorizontalAlignmentType.Right*/;
							result.verticalAlignmentType = 0/*primitives.common.VerticalAlignmentType.Top*/;
							break;
						case 2/*primitives.text.TextOrientationType.RotateRight*/:
							result.horizontalAlignmentType = 1/*primitives.common.HorizontalAlignmentType.Left*/;
							result.verticalAlignmentType = 2/*primitives.common.VerticalAlignmentType.Bottom*/;
							break;
					}
					break;
				case 5/*primitives.common.PlacementType.Bottom*/:
					result.position = new primitives.common.Rect(x + width / 2.0 - labelWidth / 2.0, y + height + labelOffset, labelWidth, labelHeight);
					switch (result.labelOrientation) {
						case 0/*primitives.text.TextOrientationType.Horizontal*/:
							result.horizontalAlignmentType = 0/*primitives.common.HorizontalAlignmentType.Center*/;
							result.verticalAlignmentType = 0/*primitives.common.VerticalAlignmentType.Top*/;
							break;
						case 1/*primitives.text.TextOrientationType.RotateLeft*/:
							result.horizontalAlignmentType = 2/*primitives.common.HorizontalAlignmentType.Right*/;
							result.verticalAlignmentType = 1/*primitives.common.VerticalAlignmentType.Middle*/;
							break;
						case 2/*primitives.text.TextOrientationType.RotateRight*/:
							result.horizontalAlignmentType = 1/*primitives.common.HorizontalAlignmentType.Left*/;
							result.verticalAlignmentType = 1/*primitives.common.VerticalAlignmentType.Middle*/;
							break;
					}
					break;
			    case 6/*primitives.common.PlacementType.BottomLeft*/:
			    case 10/*primitives.common.PlacementType.LeftBottom*/:
					result.position = new primitives.common.Rect(x - labelWidth - labelOffset, y + height + labelOffset, labelWidth, labelHeight);
					switch (result.labelOrientation) {
						case 0/*primitives.text.TextOrientationType.Horizontal*/:
							result.horizontalAlignmentType = 2/*primitives.common.HorizontalAlignmentType.Right*/;
							result.verticalAlignmentType = 0/*primitives.common.VerticalAlignmentType.Top*/;
							break;
						case 1/*primitives.text.TextOrientationType.RotateLeft*/:
							result.horizontalAlignmentType = 2/*primitives.common.HorizontalAlignmentType.Right*/;
							result.verticalAlignmentType = 2/*primitives.common.VerticalAlignmentType.Bottom*/;
							break;
						case 2/*primitives.text.TextOrientationType.RotateRight*/:
							result.horizontalAlignmentType = 1/*primitives.common.HorizontalAlignmentType.Left*/;
							result.verticalAlignmentType = 0/*primitives.common.VerticalAlignmentType.Top*/;
							break;
					}
					break;
				case 7/*primitives.common.PlacementType.Left*/:
					result.position = new primitives.common.Rect(x - labelWidth - labelOffset, y + height / 2.0 - labelHeight / 2.0, labelWidth, labelHeight);
					switch (result.labelOrientation) {
						case 0/*primitives.text.TextOrientationType.Horizontal*/:
							result.horizontalAlignmentType = 2/*primitives.common.HorizontalAlignmentType.Right*/;
							result.verticalAlignmentType = 1/*primitives.common.VerticalAlignmentType.Middle*/;
							break;
						case 1/*primitives.text.TextOrientationType.RotateLeft*/:
							result.horizontalAlignmentType = 0/*primitives.common.HorizontalAlignmentType.Center*/;
							result.verticalAlignmentType = 2/*primitives.common.VerticalAlignmentType.Bottom*/;
							break;
						case 2/*primitives.text.TextOrientationType.RotateRight*/:
							result.horizontalAlignmentType = 0/*primitives.common.HorizontalAlignmentType.Center*/;
							result.verticalAlignmentType = 0/*primitives.common.VerticalAlignmentType.Top*/;
							break;
					}
					break;
			    case 8/*primitives.common.PlacementType.TopLeft*/:
			    case 9/*primitives.common.PlacementType.LeftTop*/:
					result.position = new primitives.common.Rect(x - labelWidth - labelOffset, y - labelOffset - labelHeight, labelWidth, labelHeight);
					switch (result.labelOrientation) {
						case 0/*primitives.text.TextOrientationType.Horizontal*/:
							result.horizontalAlignmentType = 2/*primitives.common.HorizontalAlignmentType.Right*/;
							result.verticalAlignmentType = 2/*primitives.common.VerticalAlignmentType.Bottom*/;
							break;
						case 1/*primitives.text.TextOrientationType.RotateLeft*/:
							result.horizontalAlignmentType = 1/*primitives.common.HorizontalAlignmentType.Left*/;
							result.verticalAlignmentType = 2/*primitives.common.VerticalAlignmentType.Bottom*/;
							break;
						case 2/*primitives.text.TextOrientationType.RotateRight*/:
							result.horizontalAlignmentType = 2/*primitives.common.HorizontalAlignmentType.Right*/;
							result.verticalAlignmentType = 0/*primitives.common.VerticalAlignmentType.Top*/;
							break;
					}
					break;
			}
		}
	}
	return result;
};

primitives.orgdiagram.BaseController.prototype._tracePathAnnotations = function () {
    var index, len,
        index2, len2,
        index3, len3,
        firstItem, nextItem,
        treeItem,
        graph,
        path,
        items,
        connection,
        annotationConfig;

    for (index = 0, len = this.options.annotations.length; index < len; index += 1) {
        annotationConfig = this.options.annotations[index];
        switch (annotationConfig.annotationType) {
            case 2/*primitives.common.AnnotationType.HighlightPath*/:
                if (graph == null) {
                    graph = this._getConnectionsGraph();
                }
                if (annotationConfig.items != null && annotationConfig.items.length > 0) {
                    items = annotationConfig.items.slice(0);
                    firstItem = this._treeItemsByUserId[items[0]];

                    /* if annotation contains one single item we connect it to its logical parents*/
                    if (items.length == 1) {
                        for (index2 = 0, len2 = firstItem.logicalParents.length; index2 < len2; index2 += 1) {
                            nextItem = this._treeItems[firstItem.logicalParents[index2]];
                            if (nextItem.itemConfig != null) {
                                items.push(nextItem.itemConfig.id);
                            }
                        }
                    }
                    
                    if (items.length > 1) {
                        for (index2 = 1, len2 = items.length; index2 < len2; index2 += 1) {
                            nextItem = this._treeItemsByUserId[items[index2]];

                            path = this._findShortestPath(graph, firstItem, nextItem);

                            for (index3 = 1, len3 = path.length; index3 < len3; index3 += 1) {
                                connection = graph[path[index3 - 1]][path[index3]];
                                treeItem = this._treeItems[connection.id];
                                treeItem.highlightPath = 1;

                                if (connection.hasOwnProperty("partnerid")) {
                                    treeItem = this._treeItems[connection.partnerid];
                                    treeItem.partnerHighlightPath = 1;
                                }
                            }
                        }
                    }
                }
                break;
        }
    }
};

primitives.orgdiagram.BaseController.prototype._findShortestPath = function (graph, startNode, endNode) {
    var margin = {},
        distance = {},
        breadcramps = {},
        marginLength = 0,
        bestNodeOnMargin,
        bestDistanceToNode,
        key,
        children,
        newDistance,
        path,
        currentNode;

    /* add start node to margin */
    margin[startNode] = true;
    marginLength+=1;
    distance[startNode] = 0;

    /* search graph */
    while (marginLength > 0) {
        /* search for the best node on margin */
        bestNodeOnMargin = null;
        bestDistanceToNode = null;
        for (key in margin) {
            if (margin.hasOwnProperty(key)) {
                if (bestDistanceToNode == null) {
                    bestNodeOnMargin = key;
                    bestDistanceToNode = distance[key];
                } else if (bestDistanceToNode > distance[key]) {
                    bestNodeOnMargin = key;
                    bestDistanceToNode = distance[key];
                }
            }
        }

        /* itterate neighbours of selected node on margin */
        children = graph[bestNodeOnMargin];
        for (key in children) {
            if (children.hasOwnProperty(key)) {
                newDistance = bestDistanceToNode + 1; /*children[key]*/
                if (distance.hasOwnProperty(key)) {
                    if (distance[key] > newDistance) {
                        if (margin.hasOwnProperty(key)) {
                            /* improve current distance to node on margin */
                            distance[key] = newDistance;
                            breadcramps[key] = bestNodeOnMargin;
                        }
                    }
                } else {
                    distance[key] = newDistance;
                    breadcramps[key] = bestNodeOnMargin;
                    /* add new node to margin */
                    margin[key] = true;
                    marginLength += 1;
                }
            }
        }

        if (bestNodeOnMargin == endNode) {
            /* if destination node found then break */
            break;
        } else {

            /* delete visited node from margin */
            delete margin[bestNodeOnMargin];
            marginLength-=1;
        }
    }

    /* trace path */
    path = [];
    currentNode = endNode;
    while (currentNode != null) {
        path.push(currentNode);
        currentNode = breadcramps[currentNode];
    }
    return path;
};

primitives.orgdiagram.BaseController.prototype._getConnectionsGraph = function () {
    var treeLevel, index, len, index2, len2, index3, len3,
        id, treeItem,
        toItems, itemTo,
        result = {},
        forward,
        parentTreeItem;
    for (index = 0, len = this._treeLevels.length; index < len; index += 1) {
        treeLevel = this._treeLevels[index];

        for (index2 = 0, len2 = treeLevel.treeItems.length; index2 < len2; index2+=1) {
            id = treeLevel.treeItems[index2];
            treeItem = this._treeItems[id];

            forward = true;
            if (treeItem.connectorPlacement & 8/*primitives.common.SideFlag.Left*/) {
                toItems = [treeLevel.treeItems[treeItem.levelPosition - 1]];
            } else if (treeItem.connectorPlacement & 2/*primitives.common.SideFlag.Right*/) {
                toItems = [treeLevel.treeItems[treeItem.levelPosition + 1]];
            } else if (treeItem.connectorPlacement & 1/*primitives.common.SideFlag.Top*/) {
                parentTreeItem = this._treeItems[treeItem.visualParentId];
                if (parentTreeItem.partners.length > 1) {
                    toItems = parentTreeItem.partners.slice(0);
                } else {
                    toItems = [treeItem.visualParentId];
                }
            } else {
                toItems = [];
            }

            for (index3 = 0, len3 = toItems.length; index3 < len3; index3 += 1) {
                itemTo = toItems[index3];
                if (!result.hasOwnProperty(treeItem.id)) {
                    result[treeItem.id] = {};
                }
                result[treeItem.id][itemTo] = (len3 == 1) ? { id: treeItem.id } : { id: treeItem.id, partnerid: itemTo };
                if (!result.hasOwnProperty(itemTo)) {
                    result[itemTo] = {};
                }

                result[itemTo][treeItem.id] = (len3 == 1) ? { id: treeItem.id } : { id:treeItem.id, partnerid:itemTo };
            }
        }
    }
    return result;
};

primitives.orgdiagram.BaseController.prototype._drawAnnotations = function () {
    var panel,
        layer = 8/*primitives.common.Layers.ForegroundAnnotations*/,
        index, len,
        index2, len2,
        index3, len3,
        fromItem,
        toItem,
        shape,
        defaultConfig,
        item, position,
        properties, property,
        annotationConfig,
        uiHash;

    for (index = 0, len = this.options.annotations.length; index < len; index += 1) {
        annotationConfig = this.options.annotations[index];

        switch (annotationConfig.annotationType) {
            case 0/*primitives.common.AnnotationType.Connector*/:
                if (annotationConfig.fromItem != null && annotationConfig.toItem != null) {
                    fromItem = this._treeItemsByUserId[annotationConfig.fromItem];
                    toItem = this._treeItemsByUserId[annotationConfig.toItem];
                    if (fromItem != null && toItem != null) {
                        defaultConfig = new primitives.orgdiagram.ConnectorAnnotationConfig();

                        shape = new primitives.common.Connector(this.graphics);
                        shape.orientationType = this.options.orientationType;
                        properties = ["connectorShapeType", "offset", "lineWidth", "color", "lineType", "labelSize", "zOrderType"];
                        for (index3 = 0, len3 = properties.length; index3 < len3; index3 += 1) {
                            property = properties[index3];
                            shape[property] = annotationConfig[property] || defaultConfig[property];
                        }
                        shape.labelTemplate = this._annotationLabelTemplate;
                        shape.labelTemplateHashCode = this._annotationLabelTemplateHashCode;
                        shape.hasLabel = !primitives.common.isNullOrEmpty(annotationConfig.label);

                        uiHash = new primitives.common.RenderEventArgs();
                        uiHash.context = annotationConfig;

                        switch (shape.zOrderType) {
                            case 1/*primitives.common.ZOrderType.Background*/://ignore jslint
                                layer = 1/*primitives.common.Layers.BackgroundAnnotations*/;
                                break;
                            case 0/*primitives.common.ZOrderType.Auto*/://ignore jslint
                            case 2/*primitives.common.ZOrderType.Foreground*/://ignore jslint
                            default://ignore jslint
                                layer = 8/*primitives.common.Layers.ForegroundAnnotations*/;
                                break;
                        }
                        panel = this.graphics.activate("placeholder", layer);
                        shape.panelSize = panel.size;

                        this.transform.transformRect(fromItem.actualPosition.x, fromItem.actualPosition.y, fromItem.actualPosition.width, fromItem.actualPosition.height, true,
                            this, function (x, y, width, height) {
                                var fromRect = new primitives.common.Rect(x, y, width, height);
                                this.transform.transformRect(toItem.actualPosition.x, toItem.actualPosition.y, toItem.actualPosition.width, toItem.actualPosition.height, true,
                                    this, function (x, y, width, height) {
                                        var toRect = new primitives.common.Rect(x, y, width, height);
                                        shape.draw(fromRect, toRect, uiHash);
                                    });
                            });//ignore jslint
                    }
                }
                break;
            case 1/*primitives.common.AnnotationType.Shape*/:
                if (annotationConfig.items != null && annotationConfig.items.length > 0) {
                    position = new primitives.common.Rect();
                    for (index2 = 0, len2 = annotationConfig.items.length; index2 < len2; index2 += 1) {
                        item = this._treeItemsByUserId[annotationConfig.items[index2]];
                        if (item != null) {
                            position.addRect(item.actualPosition);
                        }
                    }

                    if (!position.isEmpty()) {
                        shape = new primitives.common.Shape(this.graphics);
                        defaultConfig = new primitives.orgdiagram.ShapeAnnotationConfig();
                        properties = ["opacity", "cornerRadius", "shapeType", "offset", "lineWidth", "borderColor", "fillColor", "lineType", "labelSize", "labelOffset", "labelPlacement", "zOrderType"];
                        for (index3 = 0, len3 = properties.length; index3 < len3; index3 += 1) {
                            property = properties[index3];
                            shape[property] = annotationConfig[property] || defaultConfig[property];
                        }
                        switch (shape.zOrderType) {
                            case 2/*primitives.common.ZOrderType.Foreground*/:
                                layer = 8/*primitives.common.Layers.ForegroundAnnotations*/;
                                break;
                            case 1/*primitives.common.ZOrderType.Background*/:
                                layer = 1/*primitives.common.Layers.BackgroundAnnotations*/;
                                break;
                            case 0/*primitives.common.ZOrderType.Auto*/:
                            default://ignore jslint
                                switch (shape.shapeType) {
                                    case 3/*primitives.common.ShapeType.CrossOut*/:
                                    case 1/*primitives.common.ShapeType.Oval*/:
                                    case 2/*primitives.common.ShapeType.Triangle*/:
                                        layer = 8/*primitives.common.Layers.ForegroundAnnotations*/;
                                        break;
                                    default:
                                        layer = 1/*primitives.common.Layers.BackgroundAnnotations*/;
                                        break;
                                }
                                break;
                        }
                        panel = this.graphics.activate("placeholder", layer);

                        shape.position = position;
                        shape.orientationType = this.options.orientationType;
                        shape.panelSize = panel.size;
                        shape.labelTemplate = this._annotationLabelTemplate;
                        shape.labelTemplateHashCode = this._annotationLabelTemplateHashCode;
                        shape.hasLabel = annotationConfig.templateName != null || annotationConfig.label != null;

                        uiHash = new primitives.common.RenderEventArgs();
                        uiHash.context = annotationConfig;
                        uiHash.templateName = shape.labelTemplate;

                        this.transform.transformRect(position.x, position.y, position.width, position.height, true,
                            this, function (x, y, width, height) {
                                var position = new primitives.common.Rect(x, y, width, height);
                                shape.draw(position, uiHash);
                            });//ignore jslint
                    }
                }
                break;
        }
    }
};

primitives.orgdiagram.BaseController.prototype._redrawConnectors = function () {
	var panel = this.graphics.activate("placeholder", 2/*primitives.common.Layers.Connector*/),
		rootItemId = this._visualRootItem,
		treeItem,
		treeLevel,
		attr,
		element,
		buffer, polylines, polyline,
        index, len;

	if (this._treeItems.hasOwnProperty(rootItemId)) {
		treeItem = this._treeItems[rootItemId];
		treeLevel = this._treeLevels[treeItem.level];

		buffer = new primitives.orgdiagram.Buffer(this.options);

		this._redrawConnector(panel.hasGraphics, buffer, treeItem, treeLevel);

		polylines = buffer.getPolylines();
		for (index = 0, len = polylines.length; index < len; index += 1) {
		    polyline = polylines[index];
		    if (polyline.segments.length > 0) {
		        attr = {
		            "borderColor": polyline.lineColor,
		            "lineWidth": polyline.lineWidth,
		            "lineType": polyline.lineType
		        };
		        element = this.graphics.polyline(polyline.segments, attr);
		    }
		}
	}
};

primitives.orgdiagram.BaseController.prototype._redrawConnector = function (hasGraphics, buffer, parentTreeItem, parentTreeLevel) {
	var hideConnectors,
		points,
		children,
		treeItem,
		treeLevel,
		index,
		itemToLeft,
		itemToRight,
        isSquared,
        hasSquared,
		parentHorizontalCenter,
		partnersConnectorOffset,
        childrenConnectorOffset,
        connectorStyleType = 0/*primitives.common.ConnectorStyleType.Extra*/,
        connectorPoint,
        connectionsCount,
        connectorStep,
		chartHasSquaredConnectors = (this.options.connectorType == 0/*primitives.common.ConnectorType.Squared*/),
        segments;

    
    /* Find offset of horizontal connector line between children */
    childrenConnectorOffset = parentTreeLevel.connectorShift + parentTreeLevel.levelSpace / 2 * (parentTreeLevel.childrenConnectorOffset - parentTreeItem.childrenConnectorOffset);

    /* Find offset of horizontal connector line between partners */
	if (parentTreeItem.partnerConnectorOffset > 0) {
	    partnersConnectorOffset = parentTreeLevel.connectorShift - parentTreeLevel.levelSpace / 2 * (parentTreeLevel.partnerConnectorOffset - parentTreeItem.partnerConnectorOffset + 1);
	} else {
	    if(parentTreeItem.connectorPlacement & 4/*primitives.common.SideFlag.Bottom*/) {
	        partnersConnectorOffset = parentTreeItem.actualPosition.bottom();
	    } else {
	        partnersConnectorOffset = childrenConnectorOffset;
	    }
	}

    /*draw every connector line with style from linesPalette, if linesPalette collection is empty then default style is used for all connectors
      seelcted style depends on children connector offset index
    */

    /* partners offsets starts from 1
        children offsets start from 0 */

	if (parentTreeItem.partnerConnectorOffset <= 1 && parentTreeItem.childrenConnectorOffset == 0) {
	    buffer.selectPalette(0);
	} else {
	    if (parentTreeItem.partnerConnectorOffset > 1) {
	        buffer.selectPalette(parentTreeItem.partnerConnectorOffset - 1);
	    } else {
	        buffer.selectPalette(parentTreeLevel.partnerConnectorOffset + parentTreeLevel.childrenConnectorOffset - parentTreeItem.childrenConnectorOffset);
	    }
	}

    /* draw shelf for multiple incoming parent connnections */
	connectionsCount = parentTreeItem.parentsConnectionsCount + (parentTreeItem.connectorPlacement & 1/*primitives.common.SideFlag.Top*/ ? 1 : 0);
	if (connectionsCount > 1) {
	    this.transform.transformPoints(parentTreeItem.actualPosition.horizontalCenter(), parentTreeItem.actualPosition.top(),
            parentTreeItem.actualPosition.horizontalCenter() + this.options.lineItemsInterval * (connectionsCount - 1), parentTreeItem.actualPosition.top(), true, this, function (fromX, fromY, toX, toY) {
                segments = buffer.getPolyline(0/*primitives.common.ConnectorStyleType.Extra*/).segments;
                segments.push(new primitives.common.MoveSegment(fromX, fromY));
                segments.push(new primitives.common.LineSegment(toX, toY));
            });
	}

	if (parentTreeItem.visualChildren.length > 0 || parentTreeItem.extraChildren.length > 0) {
	    hideConnectors = (parentTreeItem.actualVisibility === 4/*primitives.common.Visibility.Invisible*/) && (parentTreeItem.id === this._visualRootItem);
        parentHorizontalCenter = parentTreeItem.actualPosition.horizontalCenter();
	}

    /* Draw connector line between parent and its partners, grouping of parents */
	if (parentTreeItem.partners.length > 1 || parentTreeItem.extraPartners.length > 0) {
	    points = [];
	    children = parentTreeItem.partners;
	    for (index = 0; index < children.length; index += 1) {
	        treeItem = this._treeItems[children[index]];

	        connectorPoint = new primitives.orgdiagram.ConnectorPoint(treeItem.actualPosition.horizontalCenter(), treeItem.actualPosition.bottom());
	        connectorPoint.isSquared = true;
	        connectorPoint.highlightPath = treeItem.partnerHighlightPath;
	        connectorPoint.connectorStyleType = treeItem.partnerHighlightPath ? 2/*primitives.common.ConnectorStyleType.Highlight*/ : 1/*primitives.common.ConnectorStyleType.Regular*/;
	        points.push(connectorPoint);
	    }

	    children = parentTreeItem.extraPartners;
	    for (index = 0; index < children.length; index += 1) {
	        treeItem = this._treeItems[children[index]];

	        connectorPoint = new primitives.orgdiagram.ConnectorPoint(treeItem.actualPosition.horizontalCenter(), treeItem.actualPosition.bottom());
	        connectorPoint.isSquared = true;
	        connectorPoint.highlightPath = treeItem.partnerHighlightPath;
	        connectorPoint.connectorStyleType = treeItem.partnerHighlightPath ? 2/*primitives.common.ConnectorStyleType.Highlight*/ : 0/*primitives.common.ConnectorStyleType.Extra*/;
	        points.push(connectorPoint);
	    }

	    if (points.length > 0) {
	        points.sort(function (a, b) { return a.x - b.x; });

	        if (parentTreeItem.visualChildren.length == 0) {
	            parentHorizontalCenter = (points[0].x + points[points.length - 1].x) / 2.0;
	        }

	        this._drawTopConnectors(buffer, parentHorizontalCenter, partnersConnectorOffset, points, true);
	    }
	}

    /* Draw connector lines between parent and its children */
	if (parentTreeItem.visualChildren.length > 0 || parentTreeItem.extraChildren.length > 0) {
        points = [];
		hasSquared = false;
		children = parentTreeItem.visualChildren;
		for (index = 0; index < children.length; index += 1) {
			treeItem = this._treeItems[children[index]];
			treeLevel = this._treeLevels[treeItem.level];
			segments = buffer.getPolyline(treeItem.highlightPath ? 2/*primitives.common.ConnectorStyleType.Highlight*/ : 1/*primitives.common.ConnectorStyleType.Regular*/).segments;

			if (treeItem.connectorPlacement & 8/*primitives.common.SideFlag.Left*/ ) {
			    itemToLeft = this._treeItems[treeLevel.treeItems[treeItem.levelPosition - 1]];
			    this.transform.transformPoints(treeItem.actualPosition.x, treeItem.actualPosition.verticalCenter(),
                    itemToLeft.actualPosition.right(), treeItem.actualPosition.verticalCenter(), true, this, function (fromX, fromY, toX, toY) {
                        segments.push(new primitives.common.MoveSegment(fromX, fromY));
                        segments.push(new primitives.common.LineSegment(toX, toY));
                    });//ignore jslint
			} else if (treeItem.connectorPlacement & 2/*primitives.common.SideFlag.Right*/ ) {
			    itemToRight = this._treeItems[treeLevel.treeItems[treeItem.levelPosition + 1]];
			    this.transform.transformPoints(treeItem.actualPosition.right(), treeItem.actualPosition.verticalCenter(),
                    itemToRight.actualPosition.x, treeItem.actualPosition.verticalCenter(), true, this, function (fromX, fromY, toX, toY) {
                        segments.push(new primitives.common.MoveSegment(fromX, fromY));
                        segments.push(new primitives.common.LineSegment(toX, toY));
                    });//ignore jslint
			} else if (treeItem.connectorPlacement & 1/*primitives.common.SideFlag.Top*/) {
			    if (!hideConnectors) {
			        isSquared = true;
			        if (hasGraphics) {
			            switch (treeItem.actualVisibility) {
			                case 2/*primitives.common.Visibility.Dot*/:
			                case 3/*primitives.common.Visibility.Line*/:
			                    isSquared = chartHasSquaredConnectors;
			                    break;
			            }
			        }
			        connectorStep = 0;
			        connectorPoint = new primitives.orgdiagram.ConnectorPoint(treeItem.actualPosition.horizontalCenter() + connectorStep, treeItem.actualPosition.top());
			        connectorPoint.isSquared = isSquared;
			        connectorPoint.connectorStyleType = treeItem.highlightPath ? 2/*primitives.common.ConnectorStyleType.Highlight*/ : 1/*primitives.common.ConnectorStyleType.Regular*/;
			        points.push(connectorPoint);
                    /* is true if any child point has squared connector */
			        hasSquared = hasSquared || connectorPoint.isSquared;
			    }
			}
		}

	    /* Extra children, they are not visual children of tree item, but they need to be connected to it in multi parent chart */
		children = parentTreeItem.extraChildren;
		if (children.length > 0) {
		    for (index = 0; index < children.length; index += 1) {
		        treeItem = this._treeItems[children[index]];
		        isSquared = true;
		        if (hasGraphics) {
		            switch (treeItem.actualVisibility) {
		                case 2/*primitives.common.Visibility.Dot*/:
		                case 3/*primitives.common.Visibility.Line*/:
		                    isSquared = chartHasSquaredConnectors;
		                    break;
		            }
		        }
		        connectorStep = treeItem.parentsConnectionsIndex * this.options.lineItemsInterval;
		        treeItem.parentsConnectionsIndex += 1;
		        connectorPoint = new primitives.orgdiagram.ConnectorPoint(treeItem.actualPosition.horizontalCenter() + connectorStep, treeItem.actualPosition.top());
		        connectorPoint.isSquared = isSquared;
		        connectorPoint.connectorStyleType = treeItem.highlightPath ? 2/*primitives.common.ConnectorStyleType.Highlight*/ : 0/*primitives.common.ConnectorStyleType.Extra*/;
		        points.push(connectorPoint);
		        /* is true if any child point has squared connector */
		        hasSquared = hasSquared || connectorPoint.isSquared;
		    }
		    // sort points
		    points.sort(function (a, b) { return a.x - b.x; });
		}

        /* draw connector lines between regular children, grouping of children */
		if (!hideConnectors && points.length > 0) {
		    connectorStyleType = this._drawTopConnectors(buffer, parentHorizontalCenter, childrenConnectorOffset, points, hasSquared);
		}

	    /* Draw vertical line segment between parent and horizontal line connecting its children  */
		if (!hideConnectors) {
		    this.transform.transformPoints(parentHorizontalCenter, partnersConnectorOffset,
				parentHorizontalCenter, childrenConnectorOffset, true, this, function (fromX, fromY, toX, toY) {
				    segments = buffer.getPolyline(connectorStyleType).segments;
				    if (this.showElbowDots && parentTreeItem.partners.length > 1) {
				        segments.push(new primitives.common.DotSegment(fromX, fromY, 1));
				    }
				    segments.push(new primitives.common.MoveSegment(fromX, fromY));
				    segments.push(new primitives.common.LineSegment(toX, toY));
				    if (this.showElbowDots &&  points.length > 1) {
				        segments.push(new primitives.common.DotSegment(toX, toY, 1));
				    }
				});
		}

		children = parentTreeItem.visualChildren;
		for (index = 0; index < children.length; index += 1) {
		    treeItem = this._treeItems[children[index]];
		    treeLevel = this._treeLevels[treeItem.level];

		    this._redrawConnector(hasGraphics, buffer, treeItem, treeLevel);
		}
	}

};

primitives.orgdiagram.BaseController.prototype._drawTopConnectors = function (buffer, parentX, parentY, points, hasSquared) {
    var startIndex, endIndex, len,
        connectorPoint, curvedPoints = [],
        startX, endX,
        result = 0/*primitives.common.ConnectorStyleType.Extra*/,
        index,
        segments,
        left, right, styleType,
        leftPosition, rightPosition;

    if (hasSquared) {
        /* draw curved or angular lines on left side of pack */
        curvedPoints = [];
        for (startIndex = 0, len = points.length; startIndex < len; startIndex += 1) {
            connectorPoint = points[startIndex];
            if (connectorPoint.x < parentX && !connectorPoint.isSquared) {
                curvedPoints.push(connectorPoint);
            } else {
                break;
            }
        }
        len = curvedPoints.length;
        if (len > 0) {
            curvedPoints[len - 1].connectorStyleType = this._drawAngularConnectors(buffer, parentX, parentY, curvedPoints, false);
            result = Math.max(result, curvedPoints[len - 1].connectorStyleType);
        }

        /* draw curved or angular lines on right side of pack */
        curvedPoints = [];
        for (endIndex = points.length - 1; endIndex >= startIndex; endIndex -= 1) {
            connectorPoint = points[endIndex];

            if (connectorPoint.x > parentX && !connectorPoint.isSquared) {
                curvedPoints.push(connectorPoint);
            } else {
                break;
            }
        }

        len = curvedPoints.length;
        if (len > 0) {
            curvedPoints[len - 1].connectorStyleType = this._drawAngularConnectors(buffer, parentX, parentY, curvedPoints, false);
            result = Math.max(result, curvedPoints[len - 1].connectorStyleType);
        }

        /* all other lines are supposed to be vertical */
        for (index = startIndex; index <= endIndex; index+= 1) {
            connectorPoint = points[index];

            this.transform.transformPoints(connectorPoint.x, parentY, connectorPoint.x, connectorPoint.y, true, this, function (fromX, fromY, toX, toY) {
                segments = buffer.getPolyline(connectorPoint.connectorStyleType).segments;
                result = Math.max(result, connectorPoint.connectorStyleType);

                if (this.showElbowDots && (endIndex - startIndex > 0)) {
                    segments.push(new primitives.common.DotSegment(fromX, fromY, 1));
                }

                segments.push(new primitives.common.MoveSegment(fromX, fromY));
                segments.push(new primitives.common.LineSegment(toX, toY));
            });//ignore jslint
        }

        left = {};
        right = {};
        for (styleType in primitives.common.ConnectorStyleType) {
            if (primitives.common.ConnectorStyleType.hasOwnProperty(styleType)) {
                left[primitives.common.ConnectorStyleType[styleType]] = parentX;
                right[primitives.common.ConnectorStyleType[styleType]] = parentX;
            }
        }

        for (index = Math.max(0, startIndex - 1), len = Math.min(endIndex + 1, points.length - 1); index <= len; index += 1) {
            connectorPoint = points[index];

            left[connectorPoint.connectorStyleType] = Math.min(left[connectorPoint.connectorStyleType], connectorPoint.x);
            right[connectorPoint.connectorStyleType] = Math.max(right[connectorPoint.connectorStyleType], connectorPoint.x);
        }

        leftPosition = parentX;
        rightPosition = parentX;
        for (index = 2/*primitives.common.ConnectorStyleType.Highlight*/; index >= 0/*primitives.common.ConnectorStyleType.Extra*/; index -= 1) {

            segments = buffer.getPolyline(index).segments;

            startX = left[index];
            if (startX != null && startX < leftPosition) {
                this.transform.transformPoints(startX, parentY, leftPosition, parentY, true, this, function (startX, startY, endX, endY) {
                    segments.push(new primitives.common.MoveSegment(startX, startY));
                    segments.push(new primitives.common.LineSegment(endX, endY));
                });

                leftPosition = startX;
            }

            endX = right[index];
            if (endX != null && endX > rightPosition) {
                this.transform.transformPoints(endX, parentY, rightPosition, parentY, true, this, function (startX, startY, endX, endY) {
                    segments.push(new primitives.common.MoveSegment(startX, startY));
                    segments.push(new primitives.common.LineSegment(endX, endY));
                });

                rightPosition = endX;
            }
        }
    } else {
        /* all lines are angular or curved */
        result = Math.max(result, this._drawAngularConnectors(buffer, parentX, parentY, points, true));
    }

    return result;
};

primitives.orgdiagram.BaseController.prototype._drawAngularConnectors = function (buffer, parentX, parentY, points, drawToParent) {
    var joinPointX = null,
		index,
        len = points.length,
		rect,
        parentPoint, point,
        segments,
		result = 0/*primitives.common.ConnectorStyleType.Extra*/;

	if (drawToParent) {
	    joinPointX = parentX;
	} else {
	    joinPointX = points[len - 1].x;
	}

	parentPoint = new primitives.common.Point(joinPointX, parentY);

	for (index = 0; index < len; index += 1) {
	    point = points[index];

	    segments = buffer.getPolyline(point.connectorStyleType).segments;
	    result = Math.max(result, point.connectorStyleType);

	    this.transform.transformPoint(joinPointX, parentY, true, this, function (x, y) {
	        segments.push(new primitives.common.MoveSegment(x, y));
		});//ignore jslint
		switch (this.options.connectorType) {
		    case 1/*primitives.common.ConnectorType.Angular*/:
		        this.transform.transformPoint(point.x, point.y, true, this, function (x, y) {
		            segments.push(new primitives.common.LineSegment(x, y));
		            
		        });//ignore jslint
		        break;
		    case 2/*primitives.common.ConnectorType.Curved*/:
		        rect = new primitives.common.Rect(parentPoint, point);

		        if (drawToParent) {
		            if (joinPointX > rect.x) {
		                this.transform.transform3Points(rect.right(), rect.verticalCenter(), rect.x, rect.verticalCenter(), rect.x, rect.bottom(), true,
							this, function (cpX1, cpY1, cpX2, cpY2, x, y) {
							    segments.push(new primitives.common.CubicArcSegment(cpX1, cpY1, cpX2, cpY2, x, y));
							});//ignore jslint
		            }
		            else {
		                this.transform.transform3Points(rect.x, rect.verticalCenter(), rect.right(), rect.verticalCenter(), rect.right(), rect.bottom(), true,
							this, function (cpX1, cpY1, cpX2, cpY2, x, y) {
							    segments.push(new primitives.common.CubicArcSegment(cpX1, cpY1, cpX2, cpY2, x, y));
							});//ignore jslint
		            }
		        } else {
		            if (joinPointX > rect.x) {
		                this.transform.transformPoints(rect.x, rect.y, rect.x, rect.bottom(), true,
							this, function (cpX, cpY, x, y) {
							    segments.push(new primitives.common.QuadraticArcSegment(cpX, cpY, x, y));
							});//ignore jslint
		            } else {
		                this.transform.transformPoints(rect.right(), rect.y, rect.right(), rect.bottom(), true,
							this, function (cpX, cpY, x, y) {
							    segments.push(new primitives.common.QuadraticArcSegment(cpX, cpY, x, y));
							});//ignore jslint
		            }
		        }
		        break;
		}
	}

	return result;
};


primitives.orgdiagram.BaseController.prototype._centerOnCursor = function () {
	var panel;
	if (this._cursorTreeItem !== null) {
		panel = this.graphics.activate("placeholder", 7/*primitives.common.Layers.Item*/);
		this.transform.transformPoint(this._cursorTreeItem.actualPosition.horizontalCenter() * this.scale, this._cursorTreeItem.actualPosition.verticalCenter() * this.scale, true, this, function (x, y) {
			this.m_scrollPanel.scrollLeft(x - this.m_scrollPanelRect.horizontalCenter());
			this.m_scrollPanel.scrollTop(y - this.m_scrollPanelRect.verticalCenter());
		});
	}
};

primitives.orgdiagram.BaseController.prototype._setOption = function (key, value) {
	jQuery.Widget.prototype._setOption.apply(this, arguments);

	switch (key) {
		case "disabled":
			var handles = jQuery([]);
			if (value) {
				handles.filter(".ui-state-focus").blur();
				handles.removeClass("ui-state-hover");
				handles.propAttr("disabled", true);
				this.element.addClass("ui-disabled");
			} else {
				handles.propAttr("disabled", false);
				this.element.removeClass("ui-disabled");
			}
			break;
		default:
			break;
	}
};

primitives.orgdiagram.BaseController.prototype._getTreeItemForMousePosition = function (x, y) {
    var result = null,
		index,
		len,
		len2,
		treeLevel,
		closestItem,
		bestDistance,
		treeItem,
		itemIndex,
		currentDistance;

    this.graphics.activate("placeholder", 7/*primitives.common.Layers.Item*/);
	x = x / this.scale;
	y = y / this.scale;

	this.transform.transformPoint(x, y, false, this, function (x, y) {
		for (index = 0, len = this._treeLevels.length; index < len; index += 1) {
			treeLevel = this._treeLevels[index];

			if (y > treeLevel.topConnectorShift && y <= treeLevel.connectorShift) {
				closestItem = null;
				bestDistance = null;
				for (itemIndex = 0, len2 = treeLevel.treeItems.length; itemIndex < len2; itemIndex += 1) {
					treeItem = this._treeItems[treeLevel.treeItems[itemIndex]];

					switch (treeItem.actualVisibility) {
						case 1/*primitives.common.Visibility.Normal*/:
							if (treeItem.actualPosition.contains(x, y)) {
								result = treeItem;
								return;
							}
						case 2/*primitives.common.Visibility.Dot*/://ignore jslint
						case 3/*primitives.common.Visibility.Line*/:
							currentDistance = Math.abs(treeItem.actualPosition.horizontalCenter() - x);
							if (bestDistance === null || currentDistance < bestDistance) {
								bestDistance = currentDistance;
								closestItem = treeItem;
							}
							break;
						case 4/*primitives.common.Visibility.Invisible*/:
							break;
					}
				}
				result = closestItem;
				return;
			}
		}
		return;
	});
	return result;
};

primitives.orgdiagram.BaseController.prototype._drawHighlightAnnotation = function () {
	var common = primitives.common,
		panel,
		treeItem,
		orgItem,
		panelPosition,
		calloutPanelPosition,
		snapRect,
		snapPoint,
		position,
		uiHash,
		element,
		calloutTemplateName,
		calloutTemplate,
		showCallout = true,
		style;
	if (this._highlightTreeItem !== null) {
		switch (this._highlightTreeItem.actualVisibility) {
			case 2/*primitives.common.Visibility.Dot*/:
			case 3/*primitives.common.Visibility.Line*/:
			case 1/*primitives.common.Visibility.Normal*/:
				treeItem = this._highlightTreeItem;
				orgItem = treeItem.orgItem;

				switch (orgItem.showCallout) {
				    case 2/*primitives.common.Enabled.False*/:
				        showCallout = false;
				        break;
				    case 1/*primitives.common.Enabled.True*/:
				        showCallout = false;
				        break;
					default:
						showCallout = this.options.showCallout;
						break;
				}

				if (showCallout) {
					panelPosition = new common.Rect(
						this.m_scrollPanel.scrollLeft(),
						this.m_scrollPanel.scrollTop(),
						Math.min(this.m_scrollPanelRect.width - 25, this.m_placeholderRect.width),
						Math.min(this.m_scrollPanelRect.height - 25, this.m_placeholderRect.height)
						);

					panel = this.graphics.activate("placeholder", 7/*primitives.common.Layers.Item*/);
					this.transform.transformRect(treeItem.actualPosition.x, treeItem.actualPosition.y, treeItem.actualPosition.width, treeItem.actualPosition.height, true,
						this, function (x, y, width, height) {
							snapRect = new common.Rect(x, y, width, height);
							snapPoint = new common.Point(snapRect.horizontalCenter(), snapRect.verticalCenter());

							if (this._highlightTreeItem.actualVisibility != 1/*primitives.common.Visibility.Normal*/ || !panelPosition.overlaps(snapRect)) {
							    calloutTemplateName = !common.isNullOrEmpty(orgItem.calloutTemplateName) ? orgItem.calloutTemplateName :
									!common.isNullOrEmpty(orgItem.templateName) ? orgItem.templateName :
									!common.isNullOrEmpty(this.options.defaultCalloutTemplateName) ? this.options.defaultCalloutTemplateName :
									this.options.defaultTemplateName;
								calloutTemplate = this._templates[calloutTemplateName];
								if (calloutTemplate == null) {
									calloutTemplate = this._defaultTemplate;
								}
								position = this._getAnnotationPosition(snapPoint, panelPosition, calloutTemplate.itemSize);

								/* position callout div placeholder */
								calloutPanelPosition = new common.Rect(position);
								calloutPanelPosition.addRect(snapPoint.x, snapPoint.y);
								calloutPanelPosition.offset(50);
								style = calloutPanelPosition.getCSS();
								style.display = "inherit";
								style.visibility = "inherit";
								this.m_calloutPlaceholder.css(style);

								/* recalculate geometries */
								snapPoint.x -= calloutPanelPosition.x;
								snapPoint.y -= calloutPanelPosition.y;
								position.x -= calloutPanelPosition.x;
								position.y -= calloutPanelPosition.y;

								uiHash = new common.RenderEventArgs();
								uiHash.context = treeItem.itemConfig;
								uiHash.isCursor = treeItem.isCursor;
								uiHash.isSelected = treeItem.isSelected;
								uiHash.templateName = calloutTemplate.name;


								this.graphics.resize("calloutplaceholder", calloutPanelPosition.width, calloutPanelPosition.height);
								panel = this.graphics.activate("calloutplaceholder", 9/*primitives.common.Layers.Annotation*/);
								element = this.graphics.template(
											position.x
										, position.y
										, position.width
										, position.height
										, 0
										, 0
										, position.width
										, position.height
										, calloutTemplate.itemTemplate
										, calloutTemplate.itemTemplateHashCode
										, calloutTemplate.itemTemplateRenderName
										, uiHash
										, null
										);

								this.pointerPlacement = 0/*primitives.common.PlacementType.Auto*/;
								this.m_calloutShape.cornerRadius = this.options.calloutCornerRadius;
								this.m_calloutShape.offset = this.options.calloutOffset;
								this.m_calloutShape.opacity = this.options.calloutOpacity;
								this.m_calloutShape.lineWidth = this.options.calloutLineWidth;
								this.m_calloutShape.pointerWidth = this.options.calloutPointerWidth;
								this.m_calloutShape.borderColor = this.options.calloutBorderColor;
								this.m_calloutShape.fillColor = this.options.calloutfillColor;
								this.m_calloutShape.draw(snapPoint, position);
							} else {
								this.m_calloutPlaceholder.css({ "display": "none", "visibility": "hidden" });
							}
						});
				} else {
					this.m_calloutPlaceholder.css({ "display": "none", "visibility": "hidden" });
				}
				break;
			case 4/*primitives.common.Visibility.Invisible*/:
				this.m_calloutPlaceholder.css({"display" : "none", "visibility": "hidden"});
				break;
		}
	}
};

primitives.orgdiagram.BaseController.prototype._hideHighlightAnnotation = function () {
	this.m_calloutPlaceholder.css({ "display": "none", "visibility": "hidden" });
};

primitives.orgdiagram.BaseController.prototype._getAnnotationPosition = function (snapPoint, panelRect, itemSize) {
	var result = new primitives.common.Rect(snapPoint.x, snapPoint.y, itemSize.width, itemSize.height);

	if (snapPoint.y > panelRect.bottom() - panelRect.height / 4.0) {
		result.y -= (itemSize.height / 2.0);
		if (snapPoint.x < panelRect.horizontalCenter()) {
			result.x += itemSize.width / 4.0;
		}
		else {
			result.x -= (itemSize.width / 4.0 + itemSize.width);
		}
	}
	else {
		result.y += (itemSize.height / 4.0);
		result.x -= (itemSize.width / 2.0);
	}

	// If annotation clipped then move it back into view port
	if (result.x < panelRect.x) {
		result.x = panelRect.x + 5;
	}
	else if (result.right() > panelRect.right()) {
		result.x -= (result.right() - panelRect.right() + 5);
	}

	if (result.y < panelRect.y) {
		result.y = panelRect.y + 5;
	}
	else if (result.bottom() > panelRect.bottom()) {
		result.y -= (result.bottom() - panelRect.bottom() + 5);
	}

	return result;
};
primitives.orgdiagram.BaseController.prototype._positionTreeItems = function () {
	var panelSize = new primitives.common.Rect(0, 0, (this.m_scrollPanelRect.width - 25) / this.scale, (this.m_scrollPanelRect.height - 25) / this.scale),
		placeholderSize = new primitives.common.Rect(0, 0, 0, 0),
		levelVisibilities,
		visibilities,
		level,
		index,
		minimalPlaceholderSize,
		leftMargin,
		rightMargin,
		cursorIndex;

	switch (this.options.orientationType) {
		case 2/*primitives.common.OrientationType.Left*/:
		case 3/*primitives.common.OrientationType.Right*/:
			panelSize.invert();
			break;
	}

	if (this._treeLevels.length > 0) {
		switch (this.options.pageFitMode) {
			case 0/*primitives.common.PageFitMode.None*/:
				levelVisibilities = [new primitives.orgdiagram.LevelVisibility(0, 1/*primitives.common.Visibility.Normal*/)];
				placeholderSize = this._setTreeLevelsVisibilityAndPositionTreeItems(levelVisibilities, 0);
				break;
			default:
				levelVisibilities = [new primitives.orgdiagram.LevelVisibility(0, 1/*primitives.common.Visibility.Normal*/)];
				visibilities = [];
				switch (this.options.minimalVisibility) {
					case 1/*primitives.common.Visibility.Normal*/:
						break;
					case 2/*primitives.common.Visibility.Dot*/:
						visibilities.push(2/*primitives.common.Visibility.Dot*/);
						break;
					case 0/*primitives.common.Visibility.Auto*/:
					case 3/*primitives.common.Visibility.Line*/:
					case 4/*primitives.common.Visibility.Invisible*/:
						visibilities.push(2/*primitives.common.Visibility.Dot*/);
						visibilities.push(3/*primitives.common.Visibility.Line*/);
						break;
				}

				for (level = this._treeLevels.length - 1; level >= 0; level -= 1) {
					for (index = 0; index < visibilities.length; index += 1) {
						levelVisibilities.push(new primitives.orgdiagram.LevelVisibility(level, visibilities[index]));
					}
				}

				// Find minimal placeholder size to hold completly folded diagram
				minimalPlaceholderSize = this._setTreeLevelsVisibilityAndPositionTreeItems(levelVisibilities, levelVisibilities.length - 1);
				minimalPlaceholderSize.addRect(panelSize);
				minimalPlaceholderSize.offset(0, 0, 5, 5);

				leftMargin = null;
				rightMargin = null;
				cursorIndex = null;
				// Maximized
				placeholderSize = this._setTreeLevelsVisibilityAndPositionTreeItems(levelVisibilities, 0);
				if (!this._checkDiagramSize(placeholderSize, minimalPlaceholderSize)) {
					leftMargin = 0;

					// Minimized
					placeholderSize = this._setTreeLevelsVisibilityAndPositionTreeItems(levelVisibilities, levelVisibilities.length - 1);
					if (this._checkDiagramSize(placeholderSize, minimalPlaceholderSize)) {
						rightMargin = levelVisibilities.length - 1;

						cursorIndex = rightMargin;
						while (rightMargin - leftMargin > 1) {
							cursorIndex = Math.floor((rightMargin + leftMargin) / 2.0);

							placeholderSize = this._setTreeLevelsVisibilityAndPositionTreeItems(levelVisibilities, cursorIndex);
							if (this._checkDiagramSize(placeholderSize, minimalPlaceholderSize)) {
								rightMargin = cursorIndex;
							}
							else {
								leftMargin = cursorIndex;
							}
						}
						if (rightMargin !== cursorIndex) {
							placeholderSize = this._setTreeLevelsVisibilityAndPositionTreeItems(levelVisibilities, rightMargin);
						}
					}
				}
				break;
		}

		if (placeholderSize.width < panelSize.width) {
			this._stretchToWidth(placeholderSize.width, panelSize.width);
			placeholderSize.width = panelSize.width;
		}
		if (placeholderSize.height < panelSize.height) {
			placeholderSize.height = panelSize.height;
		}

		switch (this.options.orientationType) {
			case 2/*primitives.common.OrientationType.Left*/:
			case 3/*primitives.common.OrientationType.Right*/:
				placeholderSize.invert();
				break;
		}
		this.m_placeholder.css(placeholderSize.getCSS());
		this.m_placeholderRect = new primitives.common.Rect(placeholderSize);
	}
};

primitives.orgdiagram.BaseController.prototype._checkDiagramSize = function (diagramSize, panelSize) {
	var result = false;
	switch (this.options.pageFitMode) {
		case 1/*primitives.common.PageFitMode.PageWidth*/:
			if (panelSize.width >= diagramSize.width) {
				result = true;
			}
			break;
		case 2/*primitives.common.PageFitMode.PageHeight*/:
			if (panelSize.height >= diagramSize.height) {
				result = true;
			}
			break;
		case 3/*primitives.common.PageFitMode.FitToPage*/:
			if (panelSize.height >= diagramSize.height && panelSize.width >= diagramSize.width) {
				result = true;
			}
			break;
	}
	return result;
};

primitives.orgdiagram.BaseController.prototype._setTreeLevelsVisibilityAndPositionTreeItems = function (levelVisibilities, cursorIndex) {
	var index,
		levelVisibility;
	for (index = 0; index < this._treeLevels.length; index += 1) {
		this._treeLevels[index].currentvisibility = 1/*primitives.common.Visibility.Normal*/;
	}
	for (index = 0; index <= cursorIndex; index += 1) {
		levelVisibility = levelVisibilities[index];

		this._treeLevels[levelVisibility.level].currentvisibility = levelVisibility.currentvisibility;
	}
	this._recalcItemsSize();
	this._setOffsets();
	this._recalcLevelsDepth();
	this._shiftLevels();

	return new primitives.common.Rect(0, 0, Math.round(this._getDiagramWidth()), Math.round(this._getDiagramHeight()));
};

primitives.orgdiagram.BaseController.prototype._getDiagramHeight = function () {
	return this._treeLevels[this._treeLevels.length - 1].nextLevelShift;
};

primitives.orgdiagram.BaseController.prototype._getDiagramWidth = function () {
	var result = 0,
		index,
		len;
	for (index = 0, len = this._treeLevels.length; index < len; index += 1) {
		result = Math.max(result, this._treeLevels[index].currentOffset);
	}
	result += this.options.normalItemsInterval;
	return result;
};

primitives.orgdiagram.BaseController.prototype._setOffsets = function () {
	var index,
		len;
	for (index = 0, len = this._treeLevels.length; index < len; index += 1) {
		this._treeLevels[index].currentOffset = 0.0;
	}
	if (this._treeItems[this._visualRootItem] !== undefined) {
		this._setOffset(this._treeItems[this._visualRootItem]);
	}
};

primitives.orgdiagram.BaseController.prototype._setOffset = function (treeItem) {
	var treeLevel = this._treeLevels[treeItem.level],
		treeItemPadding = this._itemsInterval[treeItem.visibility === 0/*primitives.common.Visibility.Auto*/ ? treeLevel.currentvisibility : treeItem.visibility] / 2.0,
		index,
		len,
		offset,
		siblings,
		gaps,
		gap,
		leftMargin,
		parentItem,
		childItem,
		groups,
		items,
		item1,
		item2,
		groupIndex,
		groupOffset,
		group,
		sibling,
		cousinsInterval = treeLevel.currentOffset > 0 ? treeItemPadding * (treeItem.relationDegree) * this.options.cousinsIntervalMultiplier : 0;
	treeItem.leftPadding = treeItemPadding + cousinsInterval;
	treeItem.rightPadding = Math.max(treeItemPadding, treeItem.parentsConnectionsCount * this._itemsInterval[3/*primitives.common.Visibility.Line*/]);
	treeItem.offset = treeLevel.currentOffset + treeItem.leftPadding;
	treeLevel.currentOffset = treeItem.offset + treeItem.actualSize.width + treeItem.rightPadding;

	if (treeItem.visualChildren.length > 0) {
		for (index = 0, len = treeItem.visualChildren.length; index < len; index += 1) {
			this._setOffset(this._treeItems[treeItem.visualChildren[index]]);
		}
		offset = this._getChildrenOffset(treeItem);
		if (offset > 0) {
			this._offsetItemChildren(treeItem, offset);
		}
		else if (offset < 0) {
			offset = -offset;
			this._offsetItem(treeItem, offset);

			siblings = null;
			gaps = {};
			leftMargin = null;
			parentItem = this._getParentItem(treeItem);
			if (parentItem !== null) {
				for (index = parentItem.visualChildren.length - 1; index >= 0; index -= 1) {
					childItem = parentItem.visualChildren[index];
					if (childItem === treeItem) {
						siblings = [];
					}
					else if (siblings !== null) {
						gap = this._getGapBetweenSiblings(childItem, treeItem);
						gaps[childItem.id] = gap;
						if (gap > 0) {
							siblings.splice(0, 0, childItem);
						}
						else {
							leftMargin = childItem;
							break;
						}
					}
				}
				if (siblings.length > 0) {
					groups = null;
					if (leftMargin !== null) {
						items = [leftMargin];
						items = items.concat(siblings);
						items.push(treeItem);

						groups = [[leftMargin]];
						for (index = 1, len = items.length; index < len; index += 1) {
							item1 = items[index - 1];
							item2 = items[index];
							if (item1.gravity == 2/*primitives.common.HorizontalAlignmentType.Right*/ || item2.gravity == 1/*primitives.common.HorizontalAlignmentType.Left*/) {
							    groups[groups.length - 1].push(item2);
							}
							else {
							    groups.push([item2]);
							}
						}
					}
					else {
						groups = [siblings.slice(0)];
						groups[groups.length - 1].push(treeItem);
					}

					// align items to the right
					if (groups.length > 0) {
						siblings = groups[groups.length - 1];
						for (index = siblings.length - 2; index >= 0; index -= 1) {
							sibling = siblings[index];
							gap = gaps[sibling.id];
							offset = Math.min(gap, offset);

							this._offsetItem(sibling, offset);
							this._offsetItemChildren(sibling, offset);
						}
					}

					// spread items proportionally
					groupOffset = offset / (groups.length - 1);
					for (groupIndex = groups.length - 2; groupIndex > 0; groupIndex -= 1) {
						group = groups[groupIndex];
						for (index = group.length - 1; index >= 0; index -= 1) {
							sibling = group[index];
							gap = gaps[sibling.id];
							offset = Math.min(groupIndex * groupOffset, Math.min(gap, offset));

							this._offsetItem(sibling, offset);
							this._offsetItemChildren(sibling, offset);
						}
					}
				}
			}
		}
	}
};

primitives.orgdiagram.BaseController.prototype._getGapBetweenSiblings = function (leftItem, rightItem) {
	var result = null,
		rightMargins = this._getRightMargins(leftItem),
		leftMargins = this._getLeftMargins(rightItem),
		depth = Math.min(rightMargins.length, leftMargins.length),
		index,
		gap;

	for (index = 0; index < depth; index += 1) {
		gap = leftMargins[index] - rightMargins[index];
		result = (result !== null) ? Math.min(result, gap) : gap;

		if (gap <= 0) {
			break;
		}
	}

	return Math.floor(result);
};

primitives.orgdiagram.BaseController.prototype._getRightMargins = function (treeItem) {
	var result = [],
		rightMargins,
		index,
		len,
		marginItem;

	rightMargins = this._rightMargins[treeItem];
	if (rightMargins === undefined) {
		rightMargins = [];
	}
	rightMargins = rightMargins.slice();
	rightMargins.splice(0, 0, treeItem.id);
	for (index = 0, len = rightMargins.length; index < len; index += 1) {
		marginItem = this._treeItems[rightMargins[index]];
		result[index] = marginItem.offset + marginItem.actualSize.width + marginItem.rightPadding;
	}

	return result;
};

primitives.orgdiagram.BaseController.prototype._getLeftMargins = function (treeItem) {
	var result = [],
		leftMargins,
		index,
		len,
		marginItem;

	leftMargins = this._leftMargins[treeItem];
	if (leftMargins === undefined) {
		leftMargins = [];
	}
	leftMargins = leftMargins.slice();
	leftMargins.splice(0, 0, treeItem.id);
	for (index = 0, len = leftMargins.length; index < len; index += 1) {
		marginItem = this._treeItems[leftMargins[index]];
		result[index] = marginItem.offset - marginItem.leftPadding;
	}

	return result;
};

primitives.orgdiagram.BaseController.prototype._getChildrenOffset = function (treeItem) {
	var treeItemCenterOffset = treeItem.offset + treeItem.actualSize.width / 2.0,
		childrenCenterOffset = null,
		children,
		firstItem,
		lastItem,
		index,
		len,
		visualAggregator;
	if (treeItem.visualAggregatorId === null) {
		children = treeItem.visualChildren;
		firstItem = null;
		for (index = 0, len = children.length; index < len; index += 1) {
			firstItem = this._treeItems[children[index]];
			if (firstItem.connectorPlacement & 1/*primitives.common.SideFlag.Top*/) {
				break;
			}
		}
		lastItem = null;
		for (index = children.length - 1; index >= 0; index -= 1) {
			lastItem = this._treeItems[children[index]];
			if (lastItem.connectorPlacement & 1/*primitives.common.SideFlag.Top*/) {
				break;
			}
		}
		switch (this.options.horizontalAlignment) {
			case 1/*primitives.common.HorizontalAlignmentType.Left*/:
				childrenCenterOffset = firstItem.offset + firstItem.actualSize.width / 2.0;
				break;
			case 2/*primitives.common.HorizontalAlignmentType.Right*/:
				childrenCenterOffset = lastItem.offset + lastItem.actualSize.width / 2.0;
				break;
			case 0/*primitives.common.HorizontalAlignmentType.Center*/:
				childrenCenterOffset = (firstItem.offset + lastItem.offset + lastItem.actualSize.width) / 2.0;
				break;
		}
	}
	else {
		visualAggregator = this._treeItems[treeItem.visualAggregatorId];
		childrenCenterOffset = visualAggregator.offset + visualAggregator.actualSize.width / 2.0;
	}
	return treeItemCenterOffset - childrenCenterOffset;
};

primitives.orgdiagram.BaseController.prototype._getParentItem = function (treeItem) {
	var result = null;
	if (treeItem !== null && treeItem.visualParentId !== null) {
		result = this._treeItems[treeItem.visualParentId];
	}
	return result;
};

primitives.orgdiagram.BaseController.prototype._offsetItem = function (treeItem, offset) {
	treeItem.offset += offset;

	var treeLevel = this._treeLevels[treeItem.level];
	treeLevel.currentOffset = Math.max(treeLevel.currentOffset, treeItem.offset + treeItem.actualSize.width);
};

primitives.orgdiagram.BaseController.prototype._offsetItemChildren = function (treeItem, offset) {
	var children = treeItem.visualChildren,
		childTreeItem,
		treeLevel,
		index,
		len;
	if (children.length > 0) {
		childTreeItem = null;
		for (index = 0, len = children.length; index < len; index += 1) {
			childTreeItem = this._treeItems[children[index]];
			childTreeItem.offset += offset;

			this._offsetItemChildren(childTreeItem, offset);
		}
		treeLevel = this._treeLevels[childTreeItem.level];
		treeLevel.currentOffset = Math.max(treeLevel.currentOffset, childTreeItem.offset + childTreeItem.actualSize.width);
	}
};

primitives.orgdiagram.BaseController.prototype._stretchToWidth = function (treeWidth, panelWidth) {
	var offset,
		treeItemId;
	switch (this.options.horizontalAlignment) {
		case 1/*primitives.common.HorizontalAlignmentType.Left*/:
			offset = 0;
			break;
		case 2/*primitives.common.HorizontalAlignmentType.Right*/:
			offset = panelWidth - treeWidth;
			break;
		case 0/*primitives.common.HorizontalAlignmentType.Center*/:
			offset = (panelWidth - treeWidth) / 2.0;
			break;
	}
	if (offset > 0) {
		for (treeItemId in this._treeItems) {
			if (this._treeItems.hasOwnProperty(treeItemId)) {
				this._treeItems[treeItemId].offset += offset;
			}
		}
	}
};

primitives.orgdiagram.BaseController.prototype._recalcItemsSize = function () {
    var index, len,
        index2, len2,
        treeItem,
		treeLevel,
        treeItems;
    for (index = 0, len = this._treeLevels.length; index < len; index += 1) {
        treeLevel = this._treeLevels[index];
        treeItems = treeLevel.treeItems;

        for (index2 = 0, len2 = treeItems.length; index2 < len2; index2 += 1) {
            treeItem = this._treeItems[treeItems[index2]];

            treeItem.setActualSize(treeLevel, this.options);
        }
    }
};

primitives.orgdiagram.BaseController.prototype._recalcLevelsDepth = function () {
    var index, len,
        index2, len2,
        index3, len3,
		treeItem,
		treeLevel,
        treeItems,
		itemsPositions,
        itemPosition,
		treeItemsHavingPartners,
        treeItemsHavingExtraChildren,
        treeItemsGroup,
		partners, partner,
		levelOffset,
		children, child;

    itemsPositions = {};
    for (index = 0, len = this._treeLevels.length; index < len; index += 1) {
        treeLevel = this._treeLevels[index];
        treeItems = treeLevel.treeItems;

        for (index2 = 0, len2 = treeItems.length; index2 < len2; index2 += 1) {
            itemsPositions[treeItems[index2]] = index2;
        }
    }


    for (index = 0, len = this._treeLevels.length; index < len; index += 1) {
        treeLevel = this._treeLevels[index];
        treeLevel.shift = 0.0;
        treeLevel.depth = 0.0;
        treeLevel.partnerConnectorOffset = 0;
        treeLevel.childrenConnectorOffset = 0;
        treeLevel.actualVisibility = 4/*primitives.common.Visibility.Invisible*/;

        treeItems = treeLevel.treeItems;
        treeItemsHavingPartners = [];
        treeItemsHavingExtraChildren = [];
        for (index2 = 0, len2 = treeItems.length; index2 < len2; index2 += 1) {
            treeItem = this._treeItems[treeItems[index2]];

            treeLevel.depth = Math.max(treeLevel.depth, treeItem.actualSize.height);
            treeLevel.actualVisibility = Math.min(treeLevel.actualVisibility, treeItem.actualVisibility);

            if (treeItem.partners.length > 0 || treeItem.extraPartners.length > 0) {
                treeItemsHavingPartners.push(new primitives.orgdiagram.TreeItemsGroup(treeItem));
            }

            if (treeItem.extraChildren.length > 0) {
                treeItemsHavingExtraChildren.push(new primitives.orgdiagram.TreeItemsGroup(treeItem));
            }

            if (treeItem.connectorPlacement & 1/*primitives.common.SideFlag.Top*/) {
                treeItem.parentsConnectionsIndex = 1;
            }
        }

        
        if (treeItemsHavingPartners.length > 0) {
            levelOffset = 0;
            /* find minimum and maximum partner index at level */
            for (index2 = 0, len2 = treeItemsHavingPartners.length; index2 < len2; index2 += 1) {
                treeItemsGroup = treeItemsHavingPartners[index2];
                partners = treeItemsGroup.treeItem.partners.slice(0).concat(treeItemsGroup.treeItem.extraPartners);

                for (index3 = 0, len3 = partners.length; index3 < len3; index3 += 1) {
                    partner = this._treeItems[partners[index3]];
                    itemPosition = partner.offset + partner.actualSize.width / 2;
                    treeItemsGroup.startIndex = (treeItemsGroup.startIndex != null) ? Math.min(treeItemsGroup.startIndex, itemPosition) : itemPosition;
                    treeItemsGroup.endIndex = (treeItemsGroup.endIndex != null) ? Math.max(treeItemsGroup.endIndex, itemPosition) : itemPosition;
                }
            }

            treeLevel.partnerConnectorOffset = this._setConnectorsOffset(treeItemsHavingPartners, "partnerConnectorOffset");
        }
        

        if (treeItemsHavingExtraChildren.length > 0) {
            levelOffset = 0;

            /* find minimum and maximum partner index at level */
            for (index2 = 0, len2 = treeItemsHavingExtraChildren.length; index2 < len2; index2 += 1) {
                treeItemsGroup = treeItemsHavingExtraChildren[index2];
                children = treeItemsGroup.treeItem.visualChildren.slice(0).concat(treeItemsGroup.treeItem.extraChildren);
                children.push(treeItem.id);
                for (index3 = 0, len3 = children.length; index3 < len3; index3 += 1) {
                    child = this._treeItems[children[index3]];
                    itemPosition = child.offset + child.actualSize.width / 2;// itemsPositions[child.id];
                    treeItemsGroup.startIndex = (treeItemsGroup.startIndex != null) ? Math.min(treeItemsGroup.startIndex, itemPosition) : itemPosition;
                    treeItemsGroup.endIndex = (treeItemsGroup.endIndex != null) ? Math.max(treeItemsGroup.endIndex, itemPosition) : itemPosition;
                }
            }

            levelOffset = this._setConnectorsOffset(treeItemsHavingExtraChildren, "childrenConnectorOffset");

            treeLevel.childrenConnectorOffset = levelOffset;
        }
    }
};

primitives.orgdiagram.BaseController.prototype._setConnectorsOffset = function (treeItemsGroups, offsetPropertyName) {
    var result = 0,
        maxOffset,
        prevOffset,
        treeItemsGroup,
        index2, len2,
        index3, len3,
        points = [],
        newPoints, point,
        startPoint, endPoint,
        startPointAdded,
        endPointAdded;

    /* sort groups so we place groups having minimal distance between start and end indexes in the beggining  */
    treeItemsGroups.sort(function (a, b) { return (a.endIndex - a.startIndex) - (b.endIndex - b.startIndex); });

    /* now we stack groups so we can calculate offset for every group */
    for (index2 = 0, len2 = treeItemsGroups.length; index2 < len2; index2 += 1) {
        treeItemsGroup = treeItemsGroups[index2];
        maxOffset = 0;
        prevOffset = 0;

        startPoint = new primitives.orgdiagram.PositionOffset(treeItemsGroup.startIndex, maxOffset + 1 /* it is later redefined */);
        endPoint = new primitives.orgdiagram.PositionOffset(treeItemsGroup.endIndex, prevOffset);

        len3 = points.length;
        if (len3 > 0) {
            newPoints = [];
            startPointAdded = false;
            endPointAdded = false;
            for (index3 = 0; index3 < len3; index3+=1) {
                point = points[index3];

                if (point.position < startPoint.position) {
                    newPoints.push(point);

                    maxOffset = point.offset;
                    prevOffset = point.offset;
                } else if (point.position < endPoint.position) {
                    if (!startPointAdded) {
                        newPoints.push(startPoint);
                        startPointAdded = true;
                    }

                    maxOffset = Math.max(maxOffset, point.offset);
                    prevOffset = point.offset;
                } else {
                    if (!startPointAdded) {
                        newPoints.push(startPoint);
                        startPointAdded = true;
                    }
                    if (!endPointAdded) {
                        newPoints.push(endPoint);
                        endPointAdded = true;

                        startPoint.offset = maxOffset + 1;
                        endPoint.offset = prevOffset;
                    }

                    newPoints.push(point);
                }
            }
            if (!startPointAdded) {
                newPoints.push(startPoint);
                startPointAdded = true;
            }
            if (!endPointAdded) {
                newPoints.push(endPoint);
                endPointAdded = true;

                startPoint.offset = maxOffset + 1;
                endPoint.offset = prevOffset;
            }

            points = newPoints;
        } else {
            points = [startPoint, endPoint];
        }


        treeItemsGroup.treeItem[offsetPropertyName] = startPoint.offset;
        result = Math.max(result, startPoint.offset);
    }
    return result;
};

primitives.orgdiagram.BaseController.prototype._shiftLevels = function () {
	var shift = this.options.lineLevelShift,
		index,
		len,
		treeLevel;

	for (index = 0, len = this._treeLevels.length; index < len; index += 1) {
		treeLevel = this._treeLevels[index];
		treeLevel.shift = shift;

		treeLevel.levelSpace = this._getLevelShift(treeLevel.actualVisibility);
		treeLevel.connectorShift = treeLevel.shift + treeLevel.depth + (treeLevel.partnerConnectorOffset + 1) * (treeLevel.levelSpace / 2.0);
		treeLevel.topConnectorShift = treeLevel.shift - treeLevel.levelSpace / 2.0;
		shift += treeLevel.depth + treeLevel.levelSpace + (treeLevel.partnerConnectorOffset + treeLevel.childrenConnectorOffset) * treeLevel.levelSpace / 2.0;
		treeLevel.nextLevelShift = shift;
	}
};

primitives.orgdiagram.BaseController.prototype._getLevelShift = function (visibility) {
	var result = 0.0;

	switch (visibility) {
		case 1/*primitives.common.Visibility.Normal*/:
			result = this.options.normalLevelShift;
			break;
		case 2/*primitives.common.Visibility.Dot*/:
			result = this.options.dotLevelShift;
			break;
		case 3/*primitives.common.Visibility.Line*/:
		case 4/*primitives.common.Visibility.Invisible*/:
			result = this.options.lineLevelShift;
			break;
	}
	return result;
};
primitives.orgdiagram.BaseController.prototype._readTemplates = function () {
	var index,
		templateConfig,
		template,
		defaultTemplate;
	this._templates = {};

	defaultTemplate = new primitives.orgdiagram.Template(new primitives.orgdiagram.TemplateConfig());
	defaultTemplate.name = this.widgetEventPrefix + "Template";
	defaultTemplate.createDefaultTemplates(this.options);

	this._templates[defaultTemplate.name] = defaultTemplate;

	for (index = 0; index < this.options.templates.length; index += 1) {
		templateConfig = this.options.templates[index];

		template = new primitives.orgdiagram.Template(templateConfig);
		template.createDefaultTemplates(this.options);

		this._templates[template.name] = template;
	}
};

primitives.orgdiagram.BaseController.prototype._onDefaultTemplateRender = function (event, data) {//ignore jslint
    var itemConfig = data.context,
        itemTitleColor = itemConfig.itemTitleColor != null ? itemConfig.itemTitleColor : "#4169e1"/*primitives.common.Colors.RoyalBlue*/,
		color = primitives.common.highestContrast(itemTitleColor, this.options.itemTitleSecondFontColor, this.options.itemTitleFirstFontColor);
    data.element.find("[name=titleBackground]").css({ "background": itemTitleColor });
	data.element.find("[name=photo]").attr({ "src": itemConfig.image, "alt": itemConfig.title });
	data.element.find("[name=title]").css({ "color": color }).text(itemConfig.title);
	data.element.find("[name=description]").text(itemConfig.description);
};

primitives.orgdiagram.BaseController.prototype._createCheckBoxTemplate = function () {
	var template = jQuery('<div></div>');
	template.addClass("bp-item bp-selectioncheckbox-frame");

	template.append(jQuery('<label><nobr><input type="checkbox" name="checkbox" class="bp-selectioncheckbox" />&nbsp;<span name="selectiontext" class="bp-selectiontext">'
		+ this.options.selectCheckBoxLabel + '</span></nobr></label>'));

	this._checkBoxTemplate = template.wrap('<div>').parent().html();
	this._checkBoxTemplateHashCode = primitives.common.hashCode(this._checkBoxTemplate);
};

primitives.orgdiagram.BaseController.prototype._onCheckBoxTemplateRender = function (event, data) {//ignore jslint
	var checkBox = data.element.find("[name=checkbox]");
	checkBox.prop("checked", data.isSelected);
};

primitives.orgdiagram.BaseController.prototype._createGroupTitleTemplate = function () {
	var template = jQuery('<div></div>');
	template.addClass("bp-item bp-corner-all bp-grouptitle-frame");

	this._groupTitleTemplate = template.wrap('<div>').parent().html();
	this._groupTitleTemplateHashCode = primitives.common.hashCode(this._groupTitleTemplate);
};

primitives.orgdiagram.BaseController.prototype._onGroupTitleTemplateRender = function (event, data) {//ignore jslint
    var config = new primitives.text.Config(),
        groupTitleColor = (data.itemConfig.groupTitleColor != null ? data.itemConfig.groupTitleColor : "#4169e1"/*primitives.common.Colors.RoyalBlue*/);

	config.orientation = 2/*primitives.text.TextOrientationType.RotateRight*/;
	config.horizontalAlignment = 0/*primitives.common.HorizontalAlignmentType.Center*/;
	config.verticalAlignment = 1/*primitives.common.VerticalAlignmentType.Middle*/;
	config.text = data.itemConfig.groupTitle;
	config.fontSize = "12px";
	config.color = primitives.common.highestContrast(groupTitleColor, this.options.itemTitleSecondFontColor, this.options.itemTitleFirstFontColor);
	config.fontFamily = "Arial";
	switch (data.renderingMode) {
		case 0/*primitives.common.RenderingMode.Create*/:
			data.element.bpText(config);
			break;
		case 1/*primitives.common.RenderingMode.Update*/:
			data.element.bpText("option", config);
			data.element.bpText("update");
			break;
	}
	primitives.common.css(data.element, { "background": groupTitleColor });
};

primitives.orgdiagram.BaseController.prototype._createButtonsTemplate = function () {
	var template = jQuery("<ul></ul>");

	template.css({
		position: "absolute"
	}).addClass("ui-widget ui-helper-clearfix");

	this._buttonsTemplate = template.wrap('<div>').parent().html();
	this._buttonsTemplateHashCode = primitives.common.hashCode(this._buttonsTemplate);
};

primitives.orgdiagram.BaseController.prototype._onButtonsTemplateRender = function (event, data) {//ignore jslint
	var topOffset = 0,
		buttonsInterval = 10,
		buttonConfig,
		button,
		index;

	switch (data.renderingMode) {
		case 0/*primitives.common.RenderingMode.Create*/:
			for (index = 0; index < this.options.buttons.length; index += 1) {
				buttonConfig = this.options.buttons[index];
				button = jQuery('<li data-buttonname="' + buttonConfig.name + '"></li>')
					.css({
						position: "absolute",
						top: topOffset + "px",
						left: "0px",
						width: buttonConfig.size.width + "px",
						height: buttonConfig.size.height + "px",
						padding: "3px"
					})
					.addClass(this.widgetEventPrefix + "button");
				data.element.append(button);
				button.button({
					icons: { primary: buttonConfig.icon },
					text: buttonConfig.text,
					label: buttonConfig.label
				});

				if (!primitives.common.isNullOrEmpty(buttonConfig.tooltip)) {
				    if (button.tooltip != null) {
				        button.tooltip({ content: buttonConfig.tooltip });
				    }
				}
				topOffset += buttonsInterval + buttonConfig.size.height;
			}
			break;
		case 1/*primitives.common.RenderingMode.Update*/:
			break;
	}
};

primitives.orgdiagram.BaseController.prototype._createAnnotationLabelTemplate = function () {
    var template = jQuery('<div></div>');
    template.addClass("bp-item bp-corner-all bp-connector-label");

    this._annotationLabelTemplate = template.wrap('<div>').parent().html();
    this._annotationLabelTemplateHashCode = primitives.common.hashCode(this._annotationLabelTemplate);
};

primitives.orgdiagram.BaseController.prototype._onAnnotationLabelTemplateRender = function (event, data) {//ignore jslint
    var annotationConfig = data.context;
    data.element.html(annotationConfig.label);
};
/* this method create org tree strcuture. It is control specific and its implementation is different for org and fam charts 
    derivatives should populate 
        _orgItems
        _orgItemChildren
        _orgItemRoots
    family chart optionally populates 
        _orgChildren - When we extract families we store links to already extracted children as _orgChildren hash
        _orgPartners - When we extract families we store links to parents in other branches having the same children of
*/
primitives.orgdiagram.BaseController.prototype._createOrgTree = function () {

};

/* this method uses structures created in _createOrgTree to create visual tree used to render charts
    it populates _treeItems hash table with TreeItem-s
    
    1. Create invisble visual root item, so all orphants added to it, but since it is invisible, no connections are going to be drawn betwen them
    2. Recursivly scan _orgItems and populate visual tree hierarchy: _treeItems
        TreeItems has following important properties:
            logicalChildren &
            logicalParent(s) - they are used for navigation around chart
            visualChildren &
            visualParent - they are used to render visual hierarchy
    3. Update visual tree items and add 
        _orgChildren as extraChildren collection
        _orgPartners to extraPartners collection
        These two collections used to draw connectors between items in organizational chart
    4. Read visual tree
        populate _treeLevels array of type TreeLevel
            TreeLevel object contains ordered list of all its items 
            plus when items added to that collection we store level & levelPosition in item
        create leftMargins &
               rightMargins collections for every tree item in visual hierarchy
               they are used to for horizontal alignment of visual tree items
*/
primitives.orgdiagram.BaseController.prototype._createVisualTree = function (logicalParentItem) {
    var rootItem,
        index, len,
        orgItem, treeItem,
        orgItemId,
        orgPartners,
        orgPartnerId,
        orgTreeItem, orgPartnerTreeItem,
        index2, len2,
        orgChildren, orgChildId, partner;

    this._cursorTreeItem = null;
    this._highlightTreeItem = null;

    this._defaultTemplate = null;
    this._defaultTemplate = this._templates[this.options.defaultTemplateName];
    if (this._defaultTemplate === undefined) {
        this._defaultTemplate = this._templates[this.widgetEventPrefix + "Template"];
    }


    // Visual tree definition
    this._treeItems = {};
    this._treeItemCounter = 0; /* visual tree items counter */
    this._treeItemsByUserId = {};

    this._treeLevels = [];
    this._leftMargins = {};
    this._rightMargins = {};

    this._visualRootItem = 0;

    if (this._orgItemRoots.length > 0) {
        /* create invisible rootItem in case we have multiple items without parent */
        rootItem = this._getNewTreeItem({
            visibility: 4/*primitives.common.Visibility.Invisible*/,
            visualChildren: [],
            connectorPlacement: 0,
            visualParentId: null
        });

        for (index = 0, len = this._orgItemRoots.length; index < len; index += 1) {
            orgItem = this._orgItemRoots[index];

            treeItem = this._getNewTreeItem({
                itemConfig: orgItem.context,
                orgItem: orgItem,
                connectorPlacement: (orgItem.hideParentConnection ? 0 : 1/*primitives.common.SideFlag.Top*/) | (orgItem.hideChildrenConnection ? 0 : 4/*primitives.common.SideFlag.Bottom*/),
                visualParentId: rootItem.id
            });
            rootItem.visualChildren.push(treeItem);

            /* make new rootItem logical parent as well */
            rootItem.logicalChildren.push(treeItem);
            treeItem.logicalParents.push(rootItem.id);


            switch (treeItem.orgItem.itemType) {
                case 2/*primitives.orgdiagram.ItemType.Adviser*/:
                case 5/*primitives.orgdiagram.ItemType.SubAdviser*/:
                case 1/*primitives.orgdiagram.ItemType.Assistant*/:
                case 4/*primitives.orgdiagram.ItemType.SubAssistant*/:
                case 6/*primitives.orgdiagram.ItemType.GeneralPartner*/:
                case 7/*primitives.orgdiagram.ItemType.LimitedPartner*/:
                case 8/*primitives.orgdiagram.ItemType.AdviserPartner*/:
                    treeItem.actualItemType = 0/*primitives.orgdiagram.ItemType.Regular*/;
                    break;
                default:
                    treeItem.actualItemType = treeItem.orgItem.itemType;
                    break;
            }
            treeItem.visibility = !treeItem.orgItem.isVisible ? 4/*primitives.common.Visibility.Invisible*/ : 0/*primitives.common.Visibility.Auto*/;

            this._createVisualTreeItem(treeItem);

        }

        /*extraPartners - this is correction for family chart, we add here extraPartners which belong to different branch of organizational chart 
        but logically are partners to this item in family tree*/
        for (orgItemId in this._orgPartners) {
            if (this._orgPartners.hasOwnProperty(orgItemId)) {
                if (this._orgPartners[orgItemId] != null) {
                    orgPartners = this._orgPartners[orgItemId];

                    for (index = 0, len = orgPartners.length; index < len; index += 1) {
                        orgPartnerId = orgPartners[index];

                        orgTreeItem = this._treeItemsByUserId[orgItemId];
                        if (orgTreeItem.partners.length == 0) {
                            orgTreeItem.partners.push(orgTreeItem.id);
                        }
                        orgTreeItem.extraPartners.push(this._treeItemsByUserId[orgPartnerId].id);


                        orgPartnerTreeItem = this._treeItemsByUserId[orgPartnerId];
                        /* add logical children & logical parents here for cross family partner */
                        for (index2 = 0, len2 = orgTreeItem.logicalChildren.length; index2 < len2; index2 += 1) {
                            treeItem = this._treeItems[orgTreeItem.logicalChildren[index2]];
                            this._defineLogicalParent(orgPartnerTreeItem, treeItem);
                        }
                    }
                }
            }
        }

        

        /* extraChildren - this is correction for family chart, we add here children which belong to different branch of organizational chart 
        but logically are children to this item in family tree*/
        for (orgItemId in this._orgChildren) {
            if (this._orgChildren.hasOwnProperty(orgItemId)) {
                if (this._orgChildren[orgItemId] != null) {
                    orgTreeItem = this._treeItemsByUserId[orgItemId];
                    if (orgTreeItem.relocatedTo != null) {
                        orgTreeItem = this._treeItems[orgTreeItem.relocatedTo];
                    }

                    orgChildren = this._orgChildren[orgItemId];
                    for (index = 0, len = orgChildren.length; index < len; index += 1) {
                        orgChildId = orgChildren[index];

                        treeItem = this._treeItemsByUserId[orgChildId];
                        orgTreeItem.extraChildren.push(treeItem.id);

                        /* add logical children & logical parents here for cross family children */
                        for (index2 = 0, len2 = orgTreeItem.partners.length; index2 < len2; index2 += 1) {
                            partner = this._treeItems[orgTreeItem.partners[index2]];
                            this._defineLogicalParent(partner, treeItem);
                        }
                        this._defineLogicalParent(orgTreeItem, treeItem);

                        treeItem.parentsConnectionsCount += 1;
                    }
                }
            }
        }

        /* select cursor item */
        if (this._treeItemsByUserId.hasOwnProperty(this.options.cursorItem)) {
            this._cursorTreeItem = this._treeItemsByUserId[this.options.cursorItem];
            this._cursorTreeItem.isCursor = true;
        }
        /* select highlight item */
        if (this._treeItemsByUserId.hasOwnProperty(this.options.highlightItem)) {
            this._highlightTreeItem = this._treeItemsByUserId[this.options.highlightItem];
        }

        this._readVisualTree(this._treeItems[this._visualRootItem], 0);

        this._showSelectedItems();
        this._showCursorNeigbours();
    }
};

primitives.orgdiagram.BaseController.prototype._getNewTreeItem = function (options) {
    var result = new primitives.orgdiagram.TreeItem(this._treeItemCounter),
		optionKey;
    for (optionKey in options) {
        if (options.hasOwnProperty(optionKey)) {
            result[optionKey] = options[optionKey];
        }
    }
    this._treeItemCounter += 1;
    this._treeItems[result.id] = result; /* TreeItem reference by visual Id */
    if (options.orgItem != null) {
        this._treeItemsByUserId[options.orgItem.id] = result; /* TreeItem reference by user Id ItemConfig.id */
    }
    return result;
};

primitives.orgdiagram.BaseController.prototype._createVisualTreeItem = function (logicalParentItem) {
    var treeItem,
		orgItem,
		visualParent,
		visualAggregator,
		itemLogicalChildren,
		treeItems,
		leftSiblingIndex,
		rightSiblingIndex,
		index, len,
		childIndex,
		childrenLen,
		depth,
		rowDepths,
		rowDepth,
		rowAggregators,
		rowAggregator,
		rowChildren,
		children, childItem,
		leftSiblingOffset = 0,
		rightSiblingOffset = 0,
		partners,
		config;

    config = logicalParentItem.orgItem;
    /* find left and right siblings margins of logical parent item
       they are needed to properly place GeneralPartner & LimitedPartner nodes. */
    if (logicalParentItem.visualParentId !== null) {
        children = this._treeItems[logicalParentItem.visualParentId].visualChildren;
        index = primitives.common.indexOf(children, logicalParentItem);
        leftSiblingOffset = index;
        rightSiblingOffset = children.length - index - 1;
    }

    /* Collection contains visible logical children */
    treeItems = [];
    itemLogicalChildren = this._orgItemChildren[logicalParentItem.orgItem.id];
    if (itemLogicalChildren != null) {
        for (index = 0, len = itemLogicalChildren.length; index < len; index += 1) {
            orgItem = itemLogicalChildren[index];

            if (this.showInvisibleSubTrees || this._hasVisibleChildren(orgItem)) {
                treeItem = this._getNewTreeItem({
                    orgItem: orgItem,
                    itemConfig: orgItem.context,
                    parentId: logicalParentItem.id,
                    visualParentId: logicalParentItem.id,
                    actualItemType: orgItem.itemType
                });

                treeItems.push(treeItem);

                treeItem.visibility = !treeItem.orgItem.isVisible ? 4/*primitives.common.Visibility.Invisible*/ : 0/*primitives.common.Visibility.Auto*/;

                switch (logicalParentItem.actualItemType) {
                    case 7/*primitives.orgdiagram.ItemType.LimitedPartner*/:
                    case 8/*primitives.orgdiagram.ItemType.AdviserPartner*/:
                    case 6/*primitives.orgdiagram.ItemType.GeneralPartner*/:
                        switch (treeItem.actualItemType) {
                            case 7/*primitives.orgdiagram.ItemType.LimitedPartner*/:
                            case 8/*primitives.orgdiagram.ItemType.AdviserPartner*/:
                            case 6/*primitives.orgdiagram.ItemType.GeneralPartner*/:
                                /* Don't support partner of partner */
                                treeItem.actualItemType = 0/*primitives.orgdiagram.ItemType.Regular*/;
                                break;
                            case 0/*primitives.orgdiagram.ItemType.Regular*/:
                                /* Don't support regular children of partner */
                                treeItem.actualItemType = 1/*primitives.orgdiagram.ItemType.Assistant*/;
                                break;
                        }
                        break;
                }

                switch (treeItem.actualItemType) {
                    case 5/*primitives.orgdiagram.ItemType.SubAdviser*/:
                        this._defineLogicalParent(logicalParentItem, treeItem);
                        treeItem.connectorPlacement = 1/*primitives.common.SideFlag.Top*/ | 4/*primitives.common.SideFlag.Bottom*/;
                        treeItem = this._createNewVisualParent(treeItem);
                    case 8/*primitives.orgdiagram.ItemType.AdviserPartner*/://ignore jslint
                    case 2/*primitives.orgdiagram.ItemType.Adviser*/://ignore jslint
                        visualParent = this._treeItems[logicalParentItem.visualParentId];
                        if (logicalParentItem.connectorPlacement & 2/*primitives.common.SideFlag.Right*/) {
                            leftSiblingIndex = this._findLeftSiblingIndex(visualParent.visualChildren, logicalParentItem);
                            visualParent.visualChildren.splice(leftSiblingIndex + 1, 0, treeItem);
                            treeItem.connectorPlacement = 2/*primitives.common.SideFlag.Right*/ | 4/*primitives.common.SideFlag.Bottom*/;
                            treeItem.gravity = 2/*primitives.common.HorizontalAlignmentType.Right*/;
                        } else if (logicalParentItem.connectorPlacement & 8/*primitives.common.SideFlag.Left*/) {
                            rightSiblingIndex = this._findRightSiblingIndex(visualParent.visualChildren, logicalParentItem);
                            visualParent.visualChildren.splice(rightSiblingIndex, 0, treeItem);
                            treeItem.connectorPlacement = 8/*primitives.common.SideFlag.Left*/ | 4/*primitives.common.SideFlag.Bottom*/;
                            treeItem.gravity = 1/*primitives.common.HorizontalAlignmentType.Left*/;
                        } else {
                            switch (orgItem.adviserPlacementType) {
                                case 2/*primitives.common.AdviserPlacementType.Left*/:
                                    leftSiblingIndex = this._findLeftSiblingIndex(visualParent.visualChildren, logicalParentItem);
                                    visualParent.visualChildren.splice(leftSiblingIndex + 1, 0, treeItem);
                                    treeItem.connectorPlacement = 2/*primitives.common.SideFlag.Right*/ | 4/*primitives.common.SideFlag.Bottom*/;
                                    treeItem.gravity = 2/*primitives.common.HorizontalAlignmentType.Right*/;
                                    break;
                                default:
                                    rightSiblingIndex = this._findRightSiblingIndex(visualParent.visualChildren, logicalParentItem);
                                    visualParent.visualChildren.splice(rightSiblingIndex, 0, treeItem);
                                    treeItem.connectorPlacement = 8/*primitives.common.SideFlag.Left*/ | 4/*primitives.common.SideFlag.Bottom*/;
                                    treeItem.gravity = 1/*primitives.common.HorizontalAlignmentType.Left*/;
                                    break;
                            }
                        }
                        treeItem.visualParentId = logicalParentItem.visualParentId;

                        switch (treeItem.actualItemType) {
                            case 5/*primitives.orgdiagram.ItemType.SubAdviser*/:
                                break;
                            case 8/*primitives.orgdiagram.ItemType.AdviserPartner*/:
                                this._defineLogicalParent(this._treeItems[logicalParentItem.parentId || logicalParentItem.logicalParents[0]], treeItem);
                                break;
                            case 2/*primitives.orgdiagram.ItemType.Adviser*/:
                                this._defineLogicalParent(logicalParentItem, treeItem);
                                break;
                        }
                        break;
                    case 4/*primitives.orgdiagram.ItemType.SubAssistant*/:
                        this._defineLogicalParent(logicalParentItem, treeItem);
                        treeItem.connectorPlacement = 1/*primitives.common.SideFlag.Top*/ | 4/*primitives.common.SideFlag.Bottom*/;
                        treeItem = this._createNewVisualParent(treeItem);
                    case 1/*primitives.orgdiagram.ItemType.Assistant*/://ignore jslint
                        if (logicalParentItem.visualAggregatorId === null) {
                            this._createNewVisualAggregator(logicalParentItem);
                        }
                        switch (orgItem.adviserPlacementType) {
                            case 2/*primitives.common.AdviserPlacementType.Left*/:
                                logicalParentItem.visualChildren.splice(0, 0, treeItem);
                                treeItem.connectorPlacement = 2/*primitives.common.SideFlag.Right*/ | 4/*primitives.common.SideFlag.Bottom*/;
                                treeItem.gravity = 2/*primitives.common.HorizontalAlignmentType.Right*/;
                                break;
                            default:
                                logicalParentItem.visualChildren.push(treeItem);
                                treeItem.connectorPlacement = 8/*primitives.common.SideFlag.Left*/ | 4/*primitives.common.SideFlag.Bottom*/;
                                treeItem.gravity = 1/*primitives.common.HorizontalAlignmentType.Left*/;
                                break;
                        }
                        treeItem.visualParentId = logicalParentItem.id;
                        if (treeItem.actualItemType == 1/*primitives.orgdiagram.ItemType.Assistant*/) {
                            this._defineLogicalParent(logicalParentItem, treeItem);
                        }
                        break;
                    case 0/*primitives.orgdiagram.ItemType.Regular*/:
                        visualParent = logicalParentItem;
                        /* if node has assitants then it has visual aggregator child node */
                        if (logicalParentItem.visualAggregatorId !== null) {
                            visualParent = this._treeItems[visualParent.visualAggregatorId];
                        }
                        visualParent.visualChildren.push(treeItem);
                        treeItem.visualParentId = visualParent.id;

                        /*define logical parent*/
                        this._defineLogicalParent(logicalParentItem, treeItem);
                        treeItem.connectorPlacement = (orgItem.hideParentConnection ? 0 : 1/*primitives.common.SideFlag.Top*/) | (orgItem.hideChildrenConnection ? 0 : 4/*primitives.common.SideFlag.Bottom*/);
                        break;
                    case 7/*primitives.orgdiagram.ItemType.LimitedPartner*/:
                    case 6/*primitives.orgdiagram.ItemType.GeneralPartner*/:
                        visualParent = this._treeItems[logicalParentItem.visualParentId];
                        if (logicalParentItem.connectorPlacement & 2/*primitives.common.SideFlag.Right*/) {
                            visualParent.visualChildren.splice(leftSiblingOffset, 0, treeItem);
                            treeItem.connectorPlacement = 2/*primitives.common.SideFlag.Right*/ | 4/*primitives.common.SideFlag.Bottom*/;
                            treeItem.gravity = 2/*primitives.common.HorizontalAlignmentType.Right*/;
                        } else if (logicalParentItem.connectorPlacement & 8/*primitives.common.SideFlag.Left*/) {
                            visualParent.visualChildren.splice(visualParent.visualChildren.length - rightSiblingOffset, 0, treeItem);
                            treeItem.connectorPlacement = 8/*primitives.common.SideFlag.Left*/ | 4/*primitives.common.SideFlag.Bottom*/;
                            treeItem.gravity = 1/*primitives.common.HorizontalAlignmentType.Left*/;
                        } else {
                            switch (orgItem.adviserPlacementType) {
                                case 2/*primitives.common.AdviserPlacementType.Left*/:
                                    visualParent.visualChildren.splice(leftSiblingOffset, 0, treeItem);
                                    treeItem.gravity = 2/*primitives.common.HorizontalAlignmentType.Right*/;
                                    break;
                                default:
                                    visualParent.visualChildren.splice(visualParent.visualChildren.length - rightSiblingOffset, 0, treeItem);
                                    treeItem.gravity = 1/*primitives.common.HorizontalAlignmentType.Left*/;
                                    break;
                            }
                            switch (treeItem.actualItemType) {
                                case 6/*primitives.orgdiagram.ItemType.GeneralPartner*/:
                                    treeItem.connectorPlacement = 1/*primitives.common.SideFlag.Top*/ | 4/*primitives.common.SideFlag.Bottom*/;
                                    break;
                                case 7/*primitives.orgdiagram.ItemType.LimitedPartner*/:
                                    treeItem.connectorPlacement = 4/*primitives.common.SideFlag.Bottom*/;
                                    break;
                            }
                        }
                        treeItem.visualParentId = logicalParentItem.visualParentId;
                        this._defineLogicalParent(this._treeItems[logicalParentItem.parentId || logicalParentItem.logicalParents[0]], treeItem);
                        break;
                }
            }
        }
    }

    /* collect partners, add logicalParentItem into partners collection
       collect partners before children of children creation
    */
    partners = [];
    switch (logicalParentItem.actualItemType) {
        case 7/*primitives.orgdiagram.ItemType.LimitedPartner*/:
        case 8/*primitives.orgdiagram.ItemType.AdviserPartner*/:
        case 6/*primitives.orgdiagram.ItemType.GeneralPartner*/:
            break;
        default:
            if (logicalParentItem.visualParentId !== null) {
                visualParent = this._treeItems[logicalParentItem.visualParentId];
                for (index = leftSiblingOffset; index < visualParent.visualChildren.length - rightSiblingOffset; index += 1) {
                    childItem = visualParent.visualChildren[index];
                    if (childItem.id == logicalParentItem.id) {
                        partners.push(childItem);
                    } else {
                        switch (childItem.actualItemType) {
                            case 7/*primitives.orgdiagram.ItemType.LimitedPartner*/:
                            case 8/*primitives.orgdiagram.ItemType.AdviserPartner*/:
                            case 6/*primitives.orgdiagram.ItemType.GeneralPartner*/:
                                partners.push(childItem);
                                break;
                        }
                    }
                }
            }
            break;
    }

    /* Children are already added to visual tree 
    The following code is just rearranges them.
    */
    rowAggregators = [];
    rowChildren = [];
    this._layoutChildren(logicalParentItem, logicalParentItem.orgItem.childrenPlacementType, rowAggregators, rowChildren);

    for (index = 0, len = treeItems.length; index < len; index += 1) {
        this._createVisualTreeItem(treeItems[index]);
    }

    /* Move assistants children inside */
    if (logicalParentItem.visualAggregatorId !== null) {
        visualAggregator = this._treeItems[logicalParentItem.visualAggregatorId];
        if (visualAggregator.visualChildren.length > 0) {
            depth = this._getAssitantsDepth(logicalParentItem);
            if (depth > 1) {

                for (index = 0; index < depth - 1; index += 1) {
                    visualAggregator = this._createNewVisualAggregator(visualAggregator);
                }
            }
        }
    }

    /* Move advisers children inside */
    if (logicalParentItem.visualChildren.length > 0) {
        depth = this._getAdvisersDepth(logicalParentItem);
        if (depth > 1) {
            visualAggregator = logicalParentItem;
            for (index = 0; index < depth - 1; index += 1) {
                visualAggregator = this._createNewVisualAggregator(visualAggregator);
            }
        }
    }

    /* Move children of children inside */
    rowDepths = [];
    for (index = 0, len = rowChildren.length; index < len; index += 1) {
        children = rowChildren[index];
        rowDepths[index] = 0;
        for (childIndex = 0, childrenLen = children.length; childIndex < childrenLen; childIndex += 1) {
            rowDepths[index] = Math.max(rowDepths[index], this._getItemDepth(children[childIndex]));
        }
    }

    for (index = 0, len = rowDepths.length; index < len; index += 1) {
        rowDepth = rowDepths[index];
        if (rowDepth > 1) {
            for (childIndex = 0, childrenLen = rowAggregators[index].length; childIndex < childrenLen; childIndex += 1) {
                rowAggregator = rowAggregators[index][childIndex];
                if (rowAggregator.visualChildren.length > 0) {
                    depth = rowDepth;
                    while (depth > 1) {
                        rowAggregator = this._createNewVisualAggregator(rowAggregator);
                        depth -= 1;
                    }
                }
            }
        }
    }

    /* Align heights of partner branches in order to draw connector lines between them and logical parent children */
    this._layoutPartners(logicalParentItem, partners);
};

primitives.orgdiagram.BaseController.prototype._layoutPartners = function (treeItem, partners) {
    var partner,
		index, len,
        index2, len2,
        depth,
        maxDepth = 0,
		visualPartners = [],
        visualPartner,
		visualParent,
        visualAggregator,
        visualChildren = [],
        childItem,
        advisersDepth,
        leftSiblingIndex,
        gravity;

    /* partners collection includes treeItem 
       so we should have at least 2 items 
    */
    if (partners.length > 1) {

        /* Remove children */
        visualAggregator = this._getLastVisualAggregator(treeItem);
        visualChildren = visualChildren.concat(visualAggregator.visualChildren.slice(0));
        visualAggregator.visualChildren.length = 0;

        /* Find maximum depth required to enclose partners branches */
        for (index = 0, len = partners.length; index < len; index += 1) {
            partner = partners[index];

            advisersDepth = this._getAdvisersDepth(partner);
            depth = this._getItemDepth(partner);
            maxDepth = Math.max(Math.max(maxDepth, depth), advisersDepth);
        }

        /* Extend visual aggregators lines */
        for (index = 0, len = partners.length; index < len; index += 1) {
            partner = partners[index];
            visualPartner = this._getLastVisualAggregator(partner);
            depth = this._getLastVisualAggregatorDepth(partner);
            while (depth < maxDepth) {
                visualPartner = this._createNewVisualAggregator(visualPartner);
                depth += 1;
            }
            visualPartners.push(this._getLastVisualAggregator(visualPartner).id);
        }

        if (visualChildren.length > 0) {
            /* Select middle partner */
            visualPartner = partners[Math.floor(partners.length / 2)];
            if (partners.length > 1 && partners.length % 2 == 0) {
                /* insert invisble partner for alignemnt */
                visualParent = this._treeItems[visualPartner.visualParentId];
                leftSiblingIndex = this._findLeftSiblingIndex(visualParent.visualChildren, visualPartner);


                gravity = visualParent.visualChildren[leftSiblingIndex].gravity || visualParent.visualChildren[leftSiblingIndex + 1].gravity;

                visualPartner = this._getNewTreeItem({
                    visibility: 4/*primitives.common.Visibility.Invisible*/,
                    visualParentId: visualParent.id,
                    connectorPlacement: visualPartner.connectorPlacement & (8/*primitives.common.SideFlag.Left*/ | 2/*primitives.common.SideFlag.Right*/),
                    gravity: gravity
                });

                visualParent.visualChildren.splice(leftSiblingIndex + 1, 0, visualPartner);

                depth = 1;
                while (depth < maxDepth) {
                    visualPartner = this._createNewVisualAggregator(visualPartner);
                    visualPartner.connectorPlacement = 0;
                    depth += 1;
                }
            }

            /* Put back children */
            visualPartner = this._getLastVisualAggregator(visualPartner);
            visualPartner.visualChildren = visualChildren;
            for (index = 0, len = visualChildren.length; index < len; index += 1) {
                childItem = visualChildren[index];
                childItem.visualParentId = visualPartner.id;
            }

            /* every child is logically belongs to every partner */
            for (index = 0, len = partners.length; index < len; index += 1) {
                partner = partners[index];
                if (partner.id != treeItem.id) {
                    for (index2 = 0, len2 = treeItem.logicalChildren.length; index2 < len2; index2 += 1) {
                        childItem = treeItem.logicalChildren[index2];
                        switch (childItem.actualItemType) {
                            case 5/*primitives.orgdiagram.ItemType.SubAdviser*/:
                            case 2/*primitives.orgdiagram.ItemType.Adviser*/:
                            case 4/*primitives.orgdiagram.ItemType.SubAssistant*/:
                            case 1/*primitives.orgdiagram.ItemType.Assistant*/:
                                break;
                            default:
                                /* partners share only regular items */
                                this._defineLogicalParent(partner, childItem);
                                break;
                        }
                    }
                }
            }
        }

        /* Store collection of visual partners to draw connector lines*/
        visualPartner.partners = visualPartners;

        treeItem.relocatedTo = visualPartner.id;
    }
};

primitives.orgdiagram.BaseController.prototype._defineLogicalParent = function (logicalParentItem, treeItem) {
    var logicalParents = [],
        parents = [],
        parent,
        newParents = [],
        index,
        len;

    /* return logicalParentItem when it is visible or 
       collect all visible immidiate parents of logicalParentItem 
    */
    if (logicalParentItem.visibility === 4/*primitives.common.Visibility.Invisible*/) {
        parents = parents.concat(logicalParentItem.logicalParents);
        while (parents.length > 0) {
            for (index = 0, len = parents.length; index < len; index += 1) {
                parent = this._treeItems[parents[index]];
                if (parent.visibility === 4/*primitives.common.Visibility.Invisible*/) {
                    newParents = newParents.concat(parent.logicalParents);
                } else {
                    logicalParents.push(parent);
                }
            }
            parents = newParents;
            newParents = [];
        }
    }
    if (logicalParents.length == 0) {
        logicalParents.push(logicalParentItem);
    }

    for (index = 0, len = logicalParents.length; index < len; index += 1) {
        parent = logicalParents[index];
        parent.logicalChildren.push(treeItem);
        treeItem.logicalParents.push(parent.id);
    }
};


primitives.orgdiagram.BaseController.prototype._getLastVisualAggregatorDepth = function (treeItem) {
    var result = 0;

    while (treeItem.visualAggregatorId != null) {
        treeItem = this._treeItems[treeItem.visualAggregatorId];
        result += 1;
    }
    return result + 1;
};

primitives.orgdiagram.BaseController.prototype._getLastVisualAggregator = function (treeItem) {
    var result = treeItem;

    while (result.visualAggregatorId != null) {
        result = this._treeItems[result.visualAggregatorId];
    }
    return result;
};

primitives.orgdiagram.BaseController.prototype._createNewVisualParent = function (treeItem) {
    var result;
    result = this._getNewTreeItem({
        visibility: 4/*primitives.common.Visibility.Invisible*/,
        visualChildren: [treeItem]
    });
    treeItem.visualParentId = result.id;
    return result;
};

primitives.orgdiagram.BaseController.prototype._hasVisibleChildren = function (orgItem) {
    var result = true,
        children,
		index,
		len;
    if (!orgItem.isVisible) {
        result = false;
        children = this._orgItemChildren[orgItem.id];
        if (children != null) {
            for (index = 0, len = children.length; index < len; index += 1) {
                if (this._hasVisibleChildren(children[index])) {
                    result = true;
                    break;
                }
            }
        }
    }
    return result;
};

primitives.orgdiagram.BaseController.prototype._getAdvisersDepth = function (treeItem) {
    var result = 0,
		parentItem = this._getParentItem(treeItem),
		treeItemIndex,
		index,
		childItem;
    if (parentItem !== null) {
        treeItemIndex = primitives.common.indexOf(parentItem.visualChildren, treeItem);
        for (index = treeItemIndex + 1; index < parentItem.visualChildren.length; index += 1) {
            childItem = parentItem.visualChildren[index];
            if (childItem.connectorPlacement & 8/*primitives.common.SideFlag.Left*/) {
                result = Math.max(result, this._getItemDepth(childItem));
            }
            else {
                break;
            }
        }
        for (index = treeItemIndex - 1; index >= 0; index -= 1) {
            childItem = parentItem.visualChildren[index];
            if (childItem.connectorPlacement & 2/*primitives.common.SideFlag.Right*/) {
                result = Math.max(result, this._getItemDepth(childItem));
            }
            else {
                break;
            }
        }
    }
    return result;
};

primitives.orgdiagram.BaseController.prototype._getAssitantsDepth = function (treeItem) {
    var result = 0,
		index,
		childItem;
    for (index = 0; index < treeItem.visualChildren.length; index += 1) {
        childItem = treeItem.visualChildren[index];
        if (!(childItem.connectorPlacement & 1/*primitives.common.SideFlag.Top*/)) {
            result = Math.max(result, this._getItemDepth(childItem));
        }
    }
    return result;
};

primitives.orgdiagram.BaseController.prototype._getItemsDepth = function (items) {
    var result = 0,
		index,
        len,
		childItem;
    for (index = 0, len = items.length; index < len; index += 1) {
        childItem = items[index];
        result = Math.max(result, this._getItemDepth(childItem));
    }
    return result;
};

primitives.orgdiagram.BaseController.prototype._getItemDepth = function (treeItem) {
    var result = 0,
		index,
		len;

    for (index = 0, len = treeItem.visualChildren.length; index < len; index += 1) {
        result = Math.max(result, this._getItemDepth(treeItem.visualChildren[index]));
    }

    return result + 1;
};

primitives.orgdiagram.BaseController.prototype._layoutChildren = function (treeItem, childrenPlacementType, rowAggregators, rowChildren) {
    var visualParent,
		visualChildren,
		currentVisualParent,
		leftChildItem,
		rightChildItem,
		newAggregatorItem,
		childItem,
		width,
		height,
		twinColumns,
		column,
		row,
		index,
		len,
		singleItemPlacement;

    switch (this.options.horizontalAlignment) {
        case 0/*primitives.common.HorizontalAlignmentType.Center*/:
        case 1/*primitives.common.HorizontalAlignmentType.Left*/:
            singleItemPlacement = 3/*primitives.common.AdviserPlacementType.Right*/;
            break;
        case 2/*primitives.common.HorizontalAlignmentType.Right*/:
            singleItemPlacement = 2/*primitives.common.AdviserPlacementType.Left*/;
            break;
    }

    if (childrenPlacementType === 0/*primitives.common.ChildrenPlacementType.Auto*/) {
        if (this._hasLeavesOnly(treeItem)) {
            childrenPlacementType = (this.options.leavesPlacementType === 0/*primitives.common.ChildrenPlacementType.Auto*/) ?
				3/*primitives.common.ChildrenPlacementType.Matrix*/ : this.options.leavesPlacementType;
        }
        else {
            childrenPlacementType = (this.options.childrenPlacementType === 0/*primitives.common.ChildrenPlacementType.Auto*/) ?
				2/*primitives.common.ChildrenPlacementType.Horizontal*/ : this.options.childrenPlacementType;
        }
    }

    visualParent = treeItem;
    if (treeItem.visualAggregatorId !== null) {
        visualParent = this._treeItems[treeItem.visualAggregatorId];
    }
    switch (childrenPlacementType) {
        case 2/*primitives.common.ChildrenPlacementType.Horizontal*/:
            if (visualParent.visualChildren.length > 0) {
                this._treeItems[visualParent.visualChildren[0]].relationDegree = 1;
            }
            break;
        case 3/*primitives.common.ChildrenPlacementType.Matrix*/:
            if (visualParent.visualChildren.length > 3) {
                visualChildren = visualParent.visualChildren.slice(0);
                visualParent.visualChildren.length = 0;

                width = Math.min(this.options.maximumColumnsInMatrix, Math.ceil(Math.sqrt(visualChildren.length)));
                height = Math.ceil(visualChildren.length / width);
                twinColumns = Math.ceil(width / 2.0);
                for (column = 0; column < twinColumns; column += 1) {
                    currentVisualParent = visualParent;
                    for (row = 0; row < height; row += 1) {
                        leftChildItem = this._getMatrixItem(visualChildren, column * 2, row, width);
                        rightChildItem = this._getMatrixItem(visualChildren, column * 2 + 1, row, width);
                        if (rowAggregators[row] === undefined) {
                            rowAggregators[row] = [];
                            rowChildren[row] = [];
                        }
                        if (leftChildItem !== null) {
                            if (column == 0) {
                                leftChildItem.relationDegree = 1;
                            }
                            currentVisualParent.visualChildren.push(leftChildItem);
                            leftChildItem.visualParentId = currentVisualParent.id;
                            leftChildItem.connectorPlacement = 2/*primitives.common.SideFlag.Right*/ | 4/*primitives.common.SideFlag.Bottom*/;
                            leftChildItem.gravity = 2/*primitives.common.HorizontalAlignmentType.Right*/;

                            rowChildren[row].push(leftChildItem);
                        }
                        if (leftChildItem !== null || rightChildItem !== null) {
                            newAggregatorItem = this._getNewTreeItem({
                                visibility: 4/*primitives.common.Visibility.Invisible*/,
                                visualParentId: currentVisualParent.id,
                                connectorPlacement: 1/*primitives.common.SideFlag.Top*/ | 4/*primitives.common.SideFlag.Bottom*/
                            });
                            currentVisualParent.visualChildren.push(newAggregatorItem);
                            currentVisualParent.visualAggregatorId = newAggregatorItem.id;

                            rowAggregators[row].push(newAggregatorItem);
                        }
                        if (rightChildItem !== null) {
                            currentVisualParent.visualChildren.push(rightChildItem);
                            rightChildItem.visualParentId = currentVisualParent.id;
                            rightChildItem.connectorPlacement = 8/*primitives.common.SideFlag.Left*/ | 4/*primitives.common.SideFlag.Bottom*/;
                            rightChildItem.gravity = 1/*primitives.common.HorizontalAlignmentType.Left*/;

                            rowChildren[row].push(rightChildItem);
                        }

                        currentVisualParent = newAggregatorItem;
                    }
                }
                if (width > 2) {
                    // No center alignment to aggregator required
                    visualParent.visualAggregatorId = null;
                }
            }
            break;
        case 1/*primitives.common.ChildrenPlacementType.Vertical*/:
            visualChildren = visualParent.visualChildren.slice(0);
            visualParent.visualChildren.length = 0;

            for (index = 0, len = visualChildren.length; index < len; index += 1) {
                childItem = visualChildren[index];

                newAggregatorItem = this._getNewTreeItem({
                    visibility: 4/*primitives.common.Visibility.Invisible*/,
                    visualParentId: visualParent.id,
                    connectorPlacement: 1/*primitives.common.SideFlag.Top*/ | 4/*primitives.common.SideFlag.Bottom*/
                });

                visualParent.visualAggregatorId = newAggregatorItem.id;

                childItem.visualParentId = visualParent.id;

                switch (singleItemPlacement) {
                    case 2/*primitives.common.AdviserPlacementType.Left*/:
                        visualParent.visualChildren.push(childItem);
                        visualParent.visualChildren.push(newAggregatorItem);
                        childItem.connectorPlacement = 2/*primitives.common.SideFlag.Right*/ | 4/*primitives.common.SideFlag.Bottom*/;
                        childItem.gravity = 2/*primitives.common.HorizontalAlignmentType.Right*/;
                        break;
                    case 3/*primitives.common.AdviserPlacementType.Right*/:
                        visualParent.visualChildren.push(newAggregatorItem);
                        visualParent.visualChildren.push(childItem);
                        childItem.connectorPlacement = 8/*primitives.common.SideFlag.Left*/ | 4/*primitives.common.SideFlag.Bottom*/;
                        childItem.gravity = 1/*primitives.common.HorizontalAlignmentType.Left*/;
                        break;
                }

                rowAggregators[index] = [newAggregatorItem];
                rowChildren[index] = [childItem];

                visualParent = newAggregatorItem;
            }
            break;
    }
};

primitives.orgdiagram.BaseController.prototype._getMatrixItem = function (items, x, y, width) {
    var result,
		isOdd = (width % 2 > 0),
		index;

    if (isOdd) {
        if (x === width - 1) {
            x = items.length;
        }
        else if (x === width) {
            x = width - 1;
        }
    }
    index = y * width + x;

    result = (index > items.length - 1) ? null : items[index];

    return result;
};

primitives.orgdiagram.BaseController.prototype._hasLeavesOnly = function (treeItem) {
    var result = false,
		index,
		len,
		childItem,
		logicalChildren;

    if (treeItem.orgItem !== null) {
        logicalChildren = this._orgItemChildren[treeItem.orgItem.id];
        if (logicalChildren != null) {
            len = logicalChildren.length;
            if (len > 0) {
                result = true;
                for (index = 0; index < len; index += 1) {
                    childItem = logicalChildren[index];
                    if (childItem.itemType === 0/*primitives.orgdiagram.ItemType.Regular*/) {
                        if (this._orgItemChildren[childItem.id] != null) {
                            result = false;
                            break;
                        }
                    }
                }
            }
        }
    }
    return result;
};

/* Sibling is the first item which does not belongs to items logical hierarchy */
primitives.orgdiagram.BaseController.prototype._findLeftSiblingIndex = function (visualChildren, treeItem) {
    var result = null,
		childItem,
		index, index2, len2,
		logicalParents = {};
    for (index = visualChildren.length - 1; index >= 0; index -= 1) {
        childItem = visualChildren[index];
        if (result === null) {
            if (childItem === treeItem) {
                result = -1;
                logicalParents[treeItem] = true;
                for (index2 = 0, len2 = treeItem.logicalChildren.length; index2 < len2; index2 += 1) {
                    logicalParents[treeItem.logicalChildren[index2]] = true;
                }
            }
        }
        else {
            if (!logicalParents.hasOwnProperty(childItem)) {
                result = index;
                break;
            } else {
                for (index2 = 0, len2 = treeItem.logicalChildren.length; index2 < len2; index2 += 1) {
                    logicalParents[treeItem.logicalChildren[index2]] = true;
                }
            }
        }
    }
    return result;
};

/* Sibling is the first item which does not belongs to items logical hierarchy */
primitives.orgdiagram.BaseController.prototype._findRightSiblingIndex = function (visualChildren, treeItem) {
    var result = null,
		childItem,
		index, len, index2, len2,
		logicalParents = {};
    for (index = 0, len = visualChildren.length; index < len; index += 1) {
        childItem = visualChildren[index];
        if (result === null) {
            if (childItem === treeItem) {
                result = len;
                logicalParents[treeItem] = true;
                for (index2 = 0, len2 = treeItem.logicalChildren.length; index2 < len2; index2 += 1) {
                    logicalParents[treeItem.logicalChildren[index2]] = true;
                }
            }
        }
        else {
            if (!logicalParents.hasOwnProperty(childItem)) {
                result = index;
                break;
            } else {
                for (index2 = 0, len2 = treeItem.logicalChildren.length; index2 < len2; index2 += 1) {
                    logicalParents[treeItem.logicalChildren[index2]] = true;
                }
            }
        }
    }
    return result;
};

primitives.orgdiagram.BaseController.prototype._createNewVisualAggregator = function (treeItem) {
    var newAggregatorItem,
		index;
    newAggregatorItem = this._getNewTreeItem({
        visibility: 4/*primitives.common.Visibility.Invisible*/,
        visualParentId: treeItem.id,
        visualAggregatorId: treeItem.visualAggregatorId,
        connectorPlacement: (1/*primitives.common.SideFlag.Top*/ | 4/*primitives.common.SideFlag.Bottom*/)
    });
    newAggregatorItem.visualChildren = treeItem.visualChildren;
    for (index = 0; index < newAggregatorItem.visualChildren.length; index += 1) {
        newAggregatorItem.visualChildren[index].visualParentId = newAggregatorItem.id;
    }
    treeItem.visualChildren = [newAggregatorItem];
    treeItem.visualAggregatorId = newAggregatorItem.id;
    return newAggregatorItem;
};

primitives.orgdiagram.BaseController.prototype._readVisualTree = function (treeItem, level) {
	var treeLevel = this._treeLevels[level],
		orgItem,
		template,
		index,
		len,
		childItem;
	if (treeLevel === undefined) {
		treeLevel = this._treeLevels[level] = new primitives.orgdiagram.TreeLevel(level);
	}

	treeLevel.treeItems.push(treeItem.id);
	treeItem.level = level;
	treeItem.levelPosition = treeLevel.treeItems.length - 1;

	orgItem = treeItem.orgItem;
	if (orgItem !== null) {
	    template = this._templates[orgItem.templateName];
		treeItem.template = (template !== undefined) ? template : this._defaultTemplate;
		treeItem.actualHasSelectorCheckbox = this._getSelectionVisibility(treeItem.isCursor, orgItem.hasSelectorCheckbox, this.options.hasSelectorCheckbox);
		treeItem.actualHasButtons = (this.options.buttons.length > 0) && this._getSelectionVisibility(treeItem.isCursor, orgItem.hasButtons, this.options.hasButtons);
	}

	for (index = 0, len = treeItem.visualChildren.length; index < len; index += 1) {
		childItem = treeItem.visualChildren[index];
		
		if (index === 0) {
			this._updateLeftMargins(childItem, 0);
		}
		if (index === len - 1) {
			this._updateRightMargins(childItem, 0);
		}

		this._readVisualTree(childItem, level + 1);
	}
};

primitives.orgdiagram.BaseController.prototype._updateLeftMargins = function (treeItem, level) {
	var parentItem = treeItem,
		leftMargins;
	while ((parentItem = this._getParentItem(parentItem)) !== null) {
		leftMargins = this._leftMargins[parentItem.id];
		if (leftMargins === undefined) {
			leftMargins = this._leftMargins[parentItem.id] = [];
		}

		if (leftMargins[level] === undefined) {
			leftMargins[level] = treeItem.id;
		}
		level += 1;
	}
};

primitives.orgdiagram.BaseController.prototype._updateRightMargins = function (treeItem, level) {
	var parentItem = treeItem,
		rightMargins;
	while ((parentItem = this._getParentItem(parentItem)) !== null) {
		rightMargins = this._rightMargins[parentItem.id];
		if (rightMargins === undefined) {
			rightMargins = this._rightMargins[parentItem.id] = [];
		}

		rightMargins[level] = treeItem.id;
		level += 1;
	}
};

primitives.orgdiagram.BaseController.prototype._showSelectedItems = function () {
	var treeItem,
        index, len, index2, len2,
        selectionPathTreeItem,
		selectionPathTreeItems,
        selectedItems = [],
		annotationConfig;
    
    /* show annotated items full size*/
	for (index = 0, len = this.options.annotations.length; index < len; index += 1) {
	    annotationConfig = this.options.annotations[index];
	    if (annotationConfig.selectItems) {
	        if (annotationConfig.fromItem != null) {
	            selectedItems.push(annotationConfig.fromItem);
	        }
	        if (annotationConfig.toItem != null) {
	            selectedItems.push(annotationConfig.toItem);
	        }
	        if (annotationConfig.items != null && annotationConfig.items.length > 0) {
	            selectedItems = selectedItems.concat(annotationConfig.items);
	        }
	    }
	}

	for (index = 0, len = selectedItems.length; index < len; index += 1) {
	    treeItem = this._treeItemsByUserId[selectedItems[index]];
	    if (treeItem != null) {
	        if (treeItem.visibility === 0/*primitives.common.Visibility.Auto*/) {
	            treeItem.visibility = 1/*primitives.common.Visibility.Normal*/;
	        }
	    }
	}

	for (index = 0, len = this.options.selectedItems.length; index < len; index += 1) {
	    treeItem = this._treeItemsByUserId[this.options.selectedItems[index]];
	    if (treeItem != null) {
	        treeItem.isSelected = true;

	        if (treeItem.visibility === 0/*primitives.common.Visibility.Auto*/) {
	            treeItem.visibility = 1/*primitives.common.Visibility.Normal*/;
	        }

	        switch (this.options.selectionPathMode) {
	            case 0/*primitives.common.SelectionPathMode.None*/:
	                break;
	            case 1/*primitives.common.SelectionPathMode.FullStack*/:
	                selectionPathTreeItems = this._getAllLogicalParents(treeItem);
	                for (index2 = 0, len2 = selectionPathTreeItems.length; index2 < len2; index2 += 1) {
	                    selectionPathTreeItem = selectionPathTreeItems[index2];
	                    if (selectionPathTreeItem.visibility === 0/*primitives.common.Visibility.Auto*/) {
	                        selectionPathTreeItem.visibility = 1/*primitives.common.Visibility.Normal*/;
	                    }
	                }
	                break;
	        }
	    }
	}
};

primitives.orgdiagram.BaseController.prototype._getAllLogicalParents = function (treeItem) {
    var result = [],
        parents = [],
        parent,
        newParents = [],
        index,
        len;
    parents = parents.concat(treeItem.logicalParents);
    while (parents.length > 0) {
        for (index = 0, len = parents.length; index < len; index += 1) {
            parent = this._treeItems[parents[index]];
            result.push(parent);
            newParents = newParents.concat(parent.logicalParents);
        }
        parents = newParents;
        newParents = [];
    }
    return result;
};

primitives.orgdiagram.BaseController.prototype._showCursorNeigbours = function () {
    var index, len,
        index2, len2,
		treeItem,
		logicalParentItem,
		selectionPathTreeItem,
		selectionPathTreeItems;
	if (this._cursorTreeItem !== null) {
        /* Select the item itself */
	    if (this._cursorTreeItem.visibility === 0/*primitives.common.Visibility.Auto*/) {
	        this._cursorTreeItem.visibility = 1/*primitives.common.Visibility.Normal*/;
	    }

        /* select all children */
		for (index = 0; index < this._cursorTreeItem.logicalChildren.length; index += 1) {
			treeItem = this._cursorTreeItem.logicalChildren[index];
			if (treeItem.visibility === 0/*primitives.common.Visibility.Auto*/) {
				treeItem.visibility = 1/*primitives.common.Visibility.Normal*/;
			}
		}

        /* select all parents up to the root */
		selectionPathTreeItems = this._getAllLogicalParents(this._cursorTreeItem);
		for (index = 0, len = selectionPathTreeItems.length; index < len; index += 1) {
		    selectionPathTreeItem = selectionPathTreeItems[index];
		    if (selectionPathTreeItem.visibility === 0/*primitives.common.Visibility.Auto*/) {
		        selectionPathTreeItem.visibility = 1/*primitives.common.Visibility.Normal*/;
		    }
		}

	    /* select siblings, select all children of logical parent */
		for (index = 0, len = this._cursorTreeItem.logicalParents.length; index < len; index += 1) {
		    logicalParentItem = this._treeItems[this._cursorTreeItem.logicalParents[index]];
		    for (index2 = 0, len2 = logicalParentItem.logicalChildren.length; index2 < len2; index2 += 1) {
		        treeItem = logicalParentItem.logicalChildren[index2];
		        if (treeItem.visibility === 0/*primitives.common.Visibility.Auto*/) {
		            treeItem.visibility = 1/*primitives.common.Visibility.Normal*/;
		        }
		    }
		}
	}
};

primitives.orgdiagram.BaseController.prototype._getSelectionVisibility = function (isCursor, itemState, widgetState) {
	var result = false;
	switch (itemState) {
		case 0/*primitives.common.Enabled.Auto*/:
			switch (widgetState) {
				case 0/*primitives.common.Enabled.Auto*/:
					result = isCursor;
					break;
				case 1/*primitives.common.Enabled.True*/:
					result = true;
					break;
				case 2/*primitives.common.Enabled.False*/:
					result = false;
					break;
			}
			break;
		case 1/*primitives.common.Enabled.True*/:
			result = true;
			break;
		case 2/*primitives.common.Enabled.False*/:
			result = false;
			break;
	}
	return result;
};
/*
    Class: primitives.callout.Config
	    Callout options class.
	
*/
primitives.callout.Config = function () {
	this.classPrefix = "bpcallout";

	/*
	    Property: graphicsType
            Preferable graphics type. If preferred graphics type is not supported widget switches to first available. 

		Default:
			<primitives.common.GraphicsType.SVG>
    */
	this.graphicsType = 1/*primitives.common.GraphicsType.Canvas*/;

	/*
    Property: actualGraphicsType
        Actual graphics type.
    */
	this.actualGraphicsType = null;

	/*
	    Property: pointerPlacement
			Defines pointer connection side or corner.

		Default:
			<primitives.common.PlacementType.Auto>
    */
	this.pointerPlacement = 0/*primitives.common.PlacementType.Auto*/;

	/*
	Property: position
	    Defines callout body position. 
        
    Type:
        <primitives.common.Rect>.
    */
	this.position = null;

	/*
	Property: snapPoint
	    Callout snap point. 
        
    Type:
        <primitives.common.Point>.
    */
	this.snapPoint = null;

	/*
	Property: cornerRadius
	    Body corner radius in percents or pixels. 
    */
	this.cornerRadius = "10%";

	/*
    Property: offset
        Body rectangle offset. 
    */
	this.offset = 0;

	/*
    Property: opacity
        Background color opacity. 
    */
	this.opacity = 1;

	/*
    Property: lineWidth
        Border line width. 
    */
	this.lineWidth = 1;

    /*
    Property: lineType
        Connector's line pattern.

    Default:
        <primitives.common.LineType.Solid>
    */
	this.lineType = 0/*primitives.common.LineType.Solid*/;

	/*
    Property: pointerWidth
        Pointer base width in percents or pixels. 
    */
	this.pointerWidth = "10%";

	/*
    Property: borderColor
        Border Color. 
    
    Default:
        <primitives.common.Colors.Black>
    */
	this.borderColor = "#000000"/*primitives.common.Colors.Black*/;

	/*
    Property: fillColor
        Fill Color. 
        
    Default:
        <primitives.common.Colors.Gray>
    */
	this.fillColor = "#d3d3d3"/*primitives.common.Colors.LightGray*/;

	/*
	method: update
	    Makes full redraw of callout widget contents reevaluating all options.
    */
};
primitives.callout.Controller = function () {
	this.widgetEventPrefix = "bpcallout";

	this.options = new primitives.callout.Config();

	this.m_placeholder = null;
	this.m_panelSize = null;

	this.m_graphics = null;

	this.m_shape = null;
};

primitives.callout.Controller.prototype._create = function () {
	this.element
			.addClass("ui-widget");

	this._createLayout();

	this._redraw();
};

primitives.callout.Controller.prototype.destroy = function () {
	this._cleanLayout();
};

primitives.callout.Controller.prototype._createLayout = function () {
	this.m_panelSize = new primitives.common.Rect(0, 0, this.element.outerWidth(), this.element.outerHeight());

	this.m_placeholder = jQuery('<div></div>');
	this.m_placeholder.css({
		"position": "relative",
		"overflow": "hidden",
		"top": "0px",
		"left": "0px",
		"padding": "0px",
		"margin": "0px"
	});
	this.m_placeholder.css(this.m_panelSize.getCSS());
	this.m_placeholder.addClass("placeholder");
	this.m_placeholder.addClass(this.widgetEventPrefix);

	this.element.append(this.m_placeholder);

	this.m_graphics = primitives.common.createGraphics(this.options.graphicsType, this);

	this.options.actualGraphicsType = this.m_graphics.graphicsType;

	this.m_shape = new primitives.common.Callout(this.m_graphics);
};

primitives.callout.Controller.prototype._cleanLayout = function () {
	if (this.m_graphics !== null) {
		this.m_graphics.clean();
	}
	this.m_graphics = null;

	this.element.find("." + this.widgetEventPrefix).remove();
};

primitives.callout.Controller.prototype._updateLayout = function () {
	this.m_panelSize = new primitives.common.Rect(0, 0, this.element.innerWidth(), this.element.innerHeight());
	this.m_placeholder.css(this.m_panelSize.getCSS());
};

primitives.callout.Controller.prototype.update = function (recreate) {
	if (recreate) {
		this._cleanLayout();
		this._createLayout();
		this._redraw();
	}
	else {
		this._updateLayout();
		this.m_graphics.resize("placeholder", this.m_panelSize.width, this.m_panelSize.height);
		this.m_graphics.begin();
		this._redraw();
		this.m_graphics.end();
	}
};

primitives.callout.Controller.prototype._redraw = function () {
	var names = ["pointerPlacement", "cornerRadius", "offset", "opacity", "lineWidth", "lineType", "pointerWidth", "borderColor", "fillColor"],
		index,
		name;
	this.m_graphics.activate("placeholder");
	for (index = 0; index < names.length; index += 1) {
		name = names[index];
		this.m_shape[name] = this.options[name];
	}
	this.m_shape.draw(this.options.snapPoint, this.options.position);
};

primitives.callout.Controller.prototype._setOption = function (key, value) {
	jQuery.Widget.prototype._setOption.apply(this, arguments);

	switch (key) {
		case "disabled":
			var handles = jQuery([]);
			if (value) {
				handles.filter(".ui-state-focus").blur();
				handles.removeClass("ui-state-hover");
				handles.propAttr("disabled", true);
				this.element.addClass("ui-disabled");
			} else {
				handles.propAttr("disabled", false);
				this.element.removeClass("ui-disabled");
			}
			break;
		default:
			break;
	}
};
/*
 * jQuery UI Callout
 *
 * Basic Primitives Callout.
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function ($) {
    $.widget("ui.bpCallout", new primitives.callout.Controller());
}(jQuery));
/*
    Class: primitives.connector.Config
	    Connector options class.
	
*/
primitives.connector.Config = function () {
    this.classPrefix = "bpconnector";

	/*
	    Property: graphicsType
            Preferable graphics type. If preferred graphics type is not supported widget switches to first available. 

		Default:
			<primitives.common.GraphicsType.SVG>
    */
	this.graphicsType = 1/*primitives.common.GraphicsType.Canvas*/;

	/*
    Property: actualGraphicsType
        Actual graphics type.
    */
	this.actualGraphicsType = null;

    /*
		Property: orientationType
			Diagram orientation. 

		Default:
			<primitives.common.OrientationType.Top>
    */
	this.orientationType = 0/*primitives.common.OrientationType.Top*/;

    /*
		Property: connectorShapeType
			Connector shape type. 

		Default:
			<primitives.common.ConnectorShapeType.OneWay>
    */
	this.connectorShapeType = 0/*primitives.common.ConnectorShapeType.OneWay*/;

	/*
	Property: position
	    Defines connectors starting rectangle position. 
        
    Type:
        <primitives.common.Rect>.
    */
	this.fromRectangle = null;

    /*
	Property: position
	    Defines connectors ending rectangle position. 
        
    Type:
        <primitives.common.Rect>.
    */
	this.toRectangle = null;


	/*
    Property: offset
        Connector's from and to points offset off the rectangles side. Connectors connection points can be outside of rectangles and inside for negative offset value.
    See also:
        <primitives.common.Thickness>
    */
	this.offset = new primitives.common.Thickness(0, 0, 0, 0);

	/*
    Property: lineWidth
        Border line width. 
    */
	this.lineWidth = 3;

	/*
    Property: color
        Connector's color.
    
    Default:
        <primitives.common.Colors.Black>
    */
	this.color = "#000000"/*primitives.common.Colors.Black*/;

    /*
    Property: lineType
        Connector's line pattern.

    Default:
        <primitives.common.LineType.Solid>
    */
	this.lineType = 0/*primitives.common.LineType.Solid*/;


    /*
    Property: label
        Annotation label text. Label styled with css class name "bp-connector-label".
    */
	this.label = null;

    /*
	Property: labelSize
		Defines label size. It is needed to preserve space for label without overlapping connected items.

	Default:
		new <primitives.common.Size>(60, 30);
	*/
	this.labelSize = new primitives.common.Size(60, 30);

	/*
	method: update
	    Makes full redraw of connector widget contents reevaluating all options.
    */
};
primitives.connector.Controller = function () {
	this.widgetEventPrefix = "bpconnector";

	this.options = new primitives.connector.Config();

	this.m_placeholder = null;
	this.m_panelSize = null;

	this.m_graphics = null;

	this.m_shape = null;

	this._labelTemplate = null;
	this._labelTemplateHashCode = null;
};

primitives.connector.Controller.prototype._create = function () {
    var self = this;

	this.element
			.addClass("ui-widget");

	this._createLabelTemplate();
	this._createLayout();

	this.options.onAnnotationLabelTemplateRender = function (event, data) { self._onAnnotationLabelTemplateRender(event, data); };

	this._redraw();
};

primitives.connector.Controller.prototype.destroy = function () {
    this._cleanLayout();

    this.options.onLabelTemplateRender = null;
};

primitives.connector.Controller.prototype._createLayout = function () {
	this.m_panelSize = new primitives.common.Rect(0, 0, this.element.outerWidth(), this.element.outerHeight());

	this.m_placeholder = jQuery('<div></div>');
	this.m_placeholder.css({
		"position": "relative",
		"overflow": "hidden",
		"top": "0px",
		"left": "0px",
		"padding": "0px",
		"margin": "0px"
	});
	this.m_placeholder.css(this.m_panelSize.getCSS());
	this.m_placeholder.addClass("placeholder");
	this.m_placeholder.addClass(this.widgetEventPrefix);

	this.element.append(this.m_placeholder);

	this.m_graphics = primitives.common.createGraphics(this.options.graphicsType, this);

	this.options.actualGraphicsType = this.m_graphics.graphicsType;

	this.m_shape = new primitives.common.Connector(this.m_graphics);
};

primitives.connector.Controller.prototype._cleanLayout = function () {
	if (this.m_graphics !== null) {
		this.m_graphics.clean();
	}
	this.m_graphics = null;

	this.element.find("." + this.widgetEventPrefix).remove();
};

primitives.connector.Controller.prototype._updateLayout = function () {
	this.m_panelSize = new primitives.common.Rect(0, 0, this.element.innerWidth(), this.element.innerHeight());
	this.m_placeholder.css(this.m_panelSize.getCSS());
};

primitives.connector.Controller.prototype.update = function (recreate) {
	if (recreate) {
		this._cleanLayout();
		this._createLayout();
		this._redraw();
	}
	else {
		this._updateLayout();
		this.m_graphics.resize("placeholder", this.m_panelSize.width, this.m_panelSize.height);
		this.m_graphics.begin();
		this._redraw();
		this.m_graphics.end();
	}
};

primitives.connector.Controller.prototype._createLabelTemplate = function () {
    var template = jQuery('<div></div>');
    template.addClass("bp-item bp-corner-all bp-connector-label");

    this._labelTemplate = template.wrap('<div>').parent().html();
    this._labelTemplateHashCode = primitives.common.hashCode(this._labelTemplate);
};

primitives.connector.Controller.prototype._onAnnotationLabelTemplateRender = function (event, data) {//ignore jslint
    var label = data.element.html(this.options.label);
};

primitives.connector.Controller.prototype._redraw = function () {
    var names = ["orientationType", "connectorShapeType", "offset", "lineWidth", "color", "lineType", "labelSize"],
		index,
		name;
	this.m_graphics.activate("placeholder");
	for (index = 0; index < names.length; index += 1) {
	    name = names[index];
	    if (this.options[name] != null) {
	        this.m_shape[name] = this.options[name];
	    }
	}
	this.m_shape.hasLabel = !primitives.common.isNullOrEmpty(this.options.label);
	this.m_shape.labelTemplate = this._labelTemplate;
	this.m_shape.labelTemplateHashCode = this._labelTemplateHashCode;
	this.m_shape.panelSize = new primitives.common.Size(this.m_panelSize.width, this.m_panelSize.height);
	this.m_shape.draw(this.options.fromRectangle, this.options.toRectangle);
};

primitives.connector.Controller.prototype._setOption = function (key, value) {
	jQuery.Widget.prototype._setOption.apply(this, arguments);

	switch (key) {
		case "disabled":
			var handles = jQuery([]);
			if (value) {
				handles.filter(".ui-state-focus").blur();
				handles.removeClass("ui-state-hover");
				handles.propAttr("disabled", true);
				this.element.addClass("ui-disabled");
			} else {
				handles.propAttr("disabled", false);
				this.element.removeClass("ui-disabled");
			}
			break;
		default:
			break;
	}
};
/*
 * jQuery UI Connector
 *
 * Basic Primitives Connector.
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function ($) {
    $.widget("ui.bpConnector", new primitives.connector.Controller());
}(jQuery));
/*
    Class: primitives.famdiagram.EventArgs
	    Event details class.
*/
primitives.famdiagram.EventArgs = function () {
	/*
	Property: oldContext
	    Reference to associated previous item in hierarchy.
    */
	this.oldContext = null;

	/*
	Property: context
	    Reference to associated new item in hierarchy.
    */
	this.context = null;

	/*
    Property: parentItems
        Collection of immidiate parent items of item in context.
    */
	this.parentItems = [];

	/*
	Property: position
	    Absolute item position on diagram.

	See also:
	    <primitives.common.Rect>
    */
	this.position = null;

	/*
    Property: name
        Relative object name.

    */
	this.name = null;

	/*
	Property: cancel
	    Allows cancelation of coupled event processing. This option allows to cancel layout update 
        and subsequent <primitives.famdiagram.Config.onCursorChanged> event 
        in handler of <primitives.famdiagram.Config.onCursorChanging> event.
    */
	this.cancel = false;
};
/*
    Class: primitives.famdiagram.TemplateConfig
        User defines item template class. It may optionaly define template for item, 
		custom cursor and highlight. If template is null then default template is used.

    See Also:
		<primitives.famdiagram.Config.templates>
*/
primitives.famdiagram.TemplateConfig = function () {
	/*
	Property: name
		Every template should have unique name. It is used as reference when 
		custom template is defined in <primitives.famdiagram.ItemConfig.templateName>.
    */
	this.name = null;

	/*
	Property: itemSize
	This is item size of type <primitives.common.Size>, templates should have 
	fixed size, so famDiagram uses this value in order to layout items properly.
    */
	this.itemSize = new primitives.common.Size(120, 100);

	/*
    Property: itemBorderWidth
        Item template border width.
    */
	this.itemBorderWidth = 1;

	/*
	Property: itemTemplate
	Item template, if it is null then default item template is used. It supposed 
	to be div html element containing named elements inside for setting them 
	in <primitives.famdiagram.Config.onItemRender> event.
    */
	this.itemTemplate = null;

	/*
	Property: minimizedItemSize
	This is size dot used to display item in minimized form, type of <primitives.common.Size>.
    */
	this.minimizedItemSize = new primitives.common.Size(4, 4);

	/*
	Property: highlightPadding
	This padding around item defines relative size of highlight object, 
	ts type is <primitives.common.Thickness>.
    */
	this.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);

	/*
    Property: highlightBorderWidth
        Highlight border width.
    */
	this.highlightBorderWidth = 1;

	/*
	Property: highlightTemplate
	Highlight template, if it is null then default highlight template is used. 
	It supposed to be div html element containing named elements inside for 
	setting them in <primitives.famdiagram.Config.onHighlightRender> event.
    */
	this.highlightTemplate = null;

	/*
    Property: cursorPadding
    This padding around item defines relative size of cursor object, 
	its type is <primitives.common.Thickness>.
    */
	this.cursorPadding = new primitives.common.Thickness(3, 3, 3, 3);

	/*
    Property: cursorBorderWidth
        Cursor border width.
    */
	this.cursorBorderWidth = 2;

	/*
	Property: cursorTemplate
	Cursor template, if it is null then default cursor template is used. 
	It supposed to be div html element containing named elements inside 
	for setting them in <primitives.famdiagram.Config.onCursorRender> event.
    */
	this.cursorTemplate = null;
};
/*
    Class: primitives.famdiagram.ButtonConfig
	    Options class. Custom user button options class. 
        Buttons displayed on the right side of items. 
        See jQuery UI Button options description for details.
	    In order to receive button click event make binding 
        to <primitives.famdiagram.Config.onButtonClick>.
    
    See Also:
	    <primitives.famdiagram.Config.buttons>
*/
primitives.famdiagram.ButtonConfig = function (name, icon, tooltip) {
    /*
	Property: name 
	    It should be unique string name of the button. 
        It is needed to distinguish click events from different butons.
    */
    this.name = name;

    /*
	Property: icon
	Name of icon used in jQuery UI.
    */
    this.icon = icon;
    /*
	Property: text
	Whether to show any text -when set to false (display no text), 
    icon must be enabled, otherwise it'll be ignored.
    */
    this.text = false;
    /*
	Property: label
	Text to show on the button.
    */
    this.label = null;
	/*
	Property: tooltip
	Button tooltip content.
	*/
    this.tooltip = tooltip;
    /*
	Property: size
	Size of the button of type <primitives.common.Size>.
    */
    this.size = new primitives.common.Size(16, 16);
};
/*
    Class: primitives.famdiagram.Config
	    jQuery famDiagram Widget options class. Multi-parent hierarchical chart configuration.
	
*/
primitives.famdiagram.Config = function (name) {
	this.name = (name !== undefined) ? name : "FamDiagram";
	this.classPrefix = "famdiagram";

	/*
	    Property: graphicsType
			Preferable graphics type. If preferred graphics type 
            is not supported widget switches to first available. 

		Default:
			<primitives.common.GraphicsType.SVG>
    */
	this.graphicsType = 0/*primitives.common.GraphicsType.SVG*/;

	/*
	    Property: actualGraphicsType
			Actual graphics type.
    */
	this.actualGraphicsType = null;

	/*
	    Property: pageFitMode
            Defines the way diagram is fit into page. By default chart minimize items when it has not enough space to fit all of them into screen. 
            Chart has its maximum size when all items shown in full size and  its minimal size when all items shown as dots. 
            It is equivalent of full zoom out of the chart items, dot size items are not readable, but such presentation of them 
            gives possibility to overview chart layout. So chart tryes to combine both presenation modes and keep chart as small 
            as possible in order to give user possibility to see big picture. Collapsed items provide ideal way for analitical reiew of 
            diagram. If chart shown in its maximum size when all items are unfolded, it becomes impossible 
            to navigate betwen parents close to the root item. In such mode chart is usable only at bottom levels when children are close to their parents.
            If we try to navigate up to the root of hierarchy, gaps between parents sometimes as big as screen size. So in order to solve these 
            issues chart partially collapses hierarchy into dots and lines depending on this option.

        See also:
            <primitives.famdiagram.Config.minimalVisibility>

		Default:
			<primitives.common.PageFitMode.FitToPage>
    */
	this.pageFitMode = 3/*primitives.common.PageFitMode.FitToPage*/;

    /*
        Property: minimalVisibility
            Defines minimal allowed item form size for page fit mode. See description for pageFitMode.
    
        See also:
            <primitives.famdiagram.Config.pageFitMode>

        Default:
            <primitives.common.Visibility.Dot>
    */
	this.minimalVisibility = 2/*primitives.common.Visibility.Dot*/;

	/*
		Property: orientationType
			Chart orientation. Chart can be rotated left, right and bottom.
            Rotation to the right side is equivalent to left side placement 
            in countries writing from right to left, so it is important for localization.

		Default:
			<primitives.common.OrientationType.Top>
    */
	this.orientationType = 0/*primitives.common.OrientationType.Top*/;

    /*
    Property: verticalAlignment
        Defines items vertical alignment relative to each other within one level of hierarchy. 
        It does not affect levels having same size items.
    
    Default:
        <primitives.common.VerticalAlignmentType.Middle>
    */
	this.verticalAlignment = 1/*primitives.common.VerticalAlignmentType.Middle*/;

    /*
        Property: groupByType
           Defines the way items are grouped in multiparent chart. By default chart tries to keep all parent close to each other.

        Default:
            <primitives.common.GroupByType.Parents>
    */
	this.groupByType = 0/*primitives.common.GroupByType.Parents*/;

	/*
	Property: emptyDiagramMessage
	    Empty message in order to avoid blank screen. This option is supposed to say user that chart is empty when no data inside.
    */
	this.emptyDiagramMessage = "Diagram is empty.";

    /*
    Property: items
        This is chart items collection. It is regular array of items of type ItemConfig. Items reference each other via parents collection property. 
        So every item may have multiple parents in chart. If parents collection is empty or set to null then item supposed to be root parent.
        If items loop each other they are ignored as well. It is applications responsiblity to avoid such issues.

	See Also:
        <primitives.famdiagram.ItemConfig>
	    <primitives.famdiagram.ItemConfig.id>
        <primitives.famdiagram.ItemConfig.parents>
    */
	this.items = [];

    /*
    Property: annotations
        Defines array of annotaions objects. Chart supports several types of annotations. They are drawn on top of chart and they may block view of some of them.
        So chart's layout mechanism does not account available annotations. Don't over use this feature. 
        The design assumes only few of them being displayed simultanuosly. This is especially true for connectors.

    See also:
        <primitives.famdiagram.ConnectorAnnotationConfig>
        <primitives.famdiagram.ShapeAnnotationConfig>
    */
	this.annotations = [];

    /*
    Property: cursorItem
        Cursor item id - it is single item selection mode, user selects new cursor item on mouse click. 
        Cursor defines current local zoom placement or in other words current navigation item in the chart,
        all items relative to cursor always shoun in full size. So user can see all possible items around cursor in full size 
        and can continue navigation around chart. So when user navigates from one item to another clicking on thems and changing cursor item
        in chart, chart minimizes items going out of cursor scope and shows in full size items relative to new cursor position.
        If it is null then no cursor shown on diagram.

	See Also:
	    <primitives.famdiagram.ItemConfig.id>
        <primitives.famdiagram.Config.onCursorChanging>
        <primitives.famdiagram.Config.onCursorChanged>
    */
	this.cursorItem = null;

	/*
	Property: highlightItem
	    Highlighted item id. Highlight is mouse over affect, but using this option applicatin can set highlight at any item 
        in the chart programmatically. It can be used for chart syncronization with other controls on UI having mouse over effect. 
        See primitives.famdiagram.Config.update method arguments description for fast chart update.
        If it is null then no highlight shown on diagram.

	See Also:
	    <primitives.famdiagram.ItemConfig.id>
        <primitives.famdiagram.Config.onHighlightChanging>
        <primitives.famdiagram.Config.onHighlightChanged>
    */
	this.highligtItem = null;


	/*
	Property: selectedItems
	    Defines array of selected item ids. Chart allows to select items via checking checkboxes under items. Checkboxes are 
        shown only for full size items. So when item is selected it is always shown in full size, so check box always visible for selcted items.
        User can navigate around large diagram and check intrested items in order to keep them opened. So that way chart provides 
        means to show several items on large diagram and fit everything into minimal space ideally into available screen space.
        Application can select items programmatically using this array or receive notifications from chart about user selections with following events.

	See Also:
	    <primitives.famdiagram.ItemConfig.id>
        <primitives.famdiagram.Config.onSelectionChanging>
        <primitives.famdiagram.Config.onSelectionChanged>
    */
	this.selectedItems = [];

	/*
    Property: hasSelectorCheckbox
        This option controls selection check boxes visibility. 

    Auto - Checkbox shown only for current cursor item only.
    True - Every full size item has selection check box.
    False - No check boxes. Application can still programmatically select some items in the chart. 
    Application may provide custom item template having checkbox inside of item. If application defined check box inside of item template has name="checkbox"
    it is auto used as default selection check box.

    Default:
        <primitives.common.Enabled.Auto>

	See Also:
        <primitives.famdiagram.ItemConfig.hasSelectorCheckbox>
        <primitives.famdiagram.Config.onSelectionChanging>
        <primitives.famdiagram.Config.onSelectionChanged>
    */
	this.hasSelectorCheckbox = 0/*primitives.common.Enabled.Auto*/;

    /*
        Property: selectCheckBoxLabel
            Select check box label.
    */
	this.selectCheckBoxLabel = "Selected";

	/*
	Property: selectionPathMode
	    Defines the way items between root item and selectedItems displayed in diagram. Chart always shows all items between cursor item and its root in full size.
        But if cursor positioned on root item, then chart shows in full size only selected items in the chart. So this option controls items size between 
        selected items and root item of the chart. By default all items betwen root and selected items shown in full size.
	    
	Default:
	    <primitives.common.SelectionPathMode.FullStack>
    */
	this.selectionPathMode = 1/*primitives.common.SelectionPathMode.FullStack*/;

	/*
	Property: templates
	    Custom user templates collection. TemplateConfig is complex object providing options to customize item's content template, 
        cursor tempate and highlight template. Every template config should have unique name property, which is used by chart and its item configs 
        to reference them. Chart's defaultTemplateName allows to make template default for all items in the chart. On other hand user may define templates
        to individual items in the chart by templateName property of item config.

	See also:
	    <primitives.famdiagram.TemplateConfig>
		<primitives.famdiagram.Config.defaultTemplateName>
		<primitives.famdiagram.ItemConfig.templateName>
    */
	this.templates = [];

	/*
	    Property: defaultTemplateName
		    This is template name used to render items having no <primitives.famdiagram.ItemConfig.templateName> defined.


		See Also:
			<primitives.famdiagram.TemplateConfig>
			<primitives.famdiagram.TemplateConfig.name>
			<primitives.famdiagram.Config.templates>
	*/
	this.defaultTemplateName = null;

	/*
    Property: hasButtons
        This option controls user buttons visibility. 

    Auto - Buttons visible only for cursor item.
    True - Every normal item has buttons visible.
    False - No buttons.

    Default:
		<primitives.common.Enabled.Auto>
    */
	this.hasButtons = 0/*primitives.common.Enabled.Auto*/;

	/*
	Property: buttons
	    Custom user buttons displayed on right side of item. This collection provides simple way to define context buttons for every item. 
        The only limitation, they are all the same. So if you need to have unique buttons for every item, then you have to 
        customize cursor templates and manually create custom buttons inside of them.
	    
	See also:
	    <primitives.famdiagram.ButtonConfig>
    */
	this.buttons = [];

	/*
    Event: onHighlightChanging
        Notifies about changing highlight item <primitives.famdiagram.Config.highlightItem> in diagram.
        This coupled event with <primitives.famdiagram.Config.onHighlightChanged>, it is fired before highlight update.

    See also:
        <primitives.famdiagram.EventArgs>
    */
	this.onHighlightChanging = null;

	/*
	Event: onHighlightChanged
	    Notifies about changed highlight item <primitives.famdiagram.Config.highlightItem> in diagram.

    See also:
        <primitives.famdiagram.EventArgs>
    */
	this.onHighlightChanged = null;

	/*
    Event: onCursorChanging
        Notifies about changing cursor item <primitives.famdiagram.Config.cursorItem> in diagram.
        This coupled event with <primitives.famdiagram.Config.onCursorChanged>, it is fired before layout update.

    See also:
        <primitives.famdiagram.EventArgs>
    */
	this.onCursorChanging = null;

	/*
	Event: onCursorChanged
	    Notifies about changed cursor item <primitives.famdiagram.Config.cursorItem> in diagram .

    See also:
        <primitives.famdiagram.EventArgs>
    */
	this.onCursorChanged = null;

	/*
	Event: onSelectionChanging
	    Notifies about changing selected items collection of <primitives.famdiagram.Config.selectedItems>.

    See also:
        <primitives.famdiagram.EventArgs>
    */
	this.onSelectionChanging = null;

	/*
	Event: onSelectionChanged
	    Notifies about changes in collection of <primitives.famdiagram.Config.selectedItems>.

    See also:
        <primitives.famdiagram.EventArgs>
    */
	this.onSelectionChanged = null;

	/*
	Event: onButtonClick
	    Notifies about click of custom user button defined in colelction of <primitives.famdiagram.Config.buttons>.

    See also:
        <primitives.famdiagram.EventArgs>
    */
	this.onButtonClick = null;

	/*
	Event: onMouseClick
	    On mouse click event. 

    See also:
        <primitives.famdiagram.EventArgs>
    */
	this.onMouseClick = null;

	/*
	Event: onItemRender
	    Item templates don't provide means to bind data of items into templates. So this event handler gives application such possibility.
        If application uses custom templates then this method is called to populate template with items properties.

    See also:
        <primitives.common.RenderEventArgs>
        <primitives.famdiagram.TemplateConfig>
        <primitives.famdiagram.Config.templates>
    */
	this.onItemRender = null;

	/*
	Event: onHighlightRender
	    If user defined custom highlight template for item template 
		then this method is called to populate it with context data.

    See also:
        <primitives.common.RenderEventArgs>
        <primitives.famdiagram.TemplateConfig>
        <primitives.famdiagram.Config.templates>
    */
	this.onHighlightRender = null;
	/*
	Event: onCursorRender
	    If user defined custom cursor template for item template 
		then this method is called to populate it with context data.

    See also:
        <primitives.common.RenderEventArgs>
        <primitives.famdiagram.TemplateConfig>
        <primitives.famdiagram.Config.templates>
    */
	this.onCursorRender = null;
	/*
	Property: normalLevelShift
	    Defines interval after level of items in  diagram having items in normal state.
    */
	this.normalLevelShift = 20;
	/*
	Property: dotLevelShift
	    Defines interval after level of items in  diagram having all items in dot state.
    */
	this.dotLevelShift = 20;
	/*
	Property: lineLevelShift
	    Defines interval after level of items in  diagram having items in line state.
    */
	this.lineLevelShift = 10;

	/*
	Property: normalItemsInterval
	    Defines interval between items at the same level in  diagram having items in normal state.
    */
	this.normalItemsInterval = 10;
	/*
	Property: dotItemsInterval
	    Defines interval between items at the same level in  diagram having items in dot state.
    */
	this.dotItemsInterval = 1;
	/*
	Property: lineItemsInterval
	    Defines interval between items at the same level in  diagram having items in line state.
    */
	this.lineItemsInterval = 2;

	/*
	Property: cousinsIntervalMultiplier
        Use this interval multiplier between cousins in hiearchy. The idea of this option to make extra space between cousins. 
        So children belonging to different parents have extra gap between them.
		
	*/
	this.cousinsIntervalMultiplier = 5;

	/*
	method: update
	    Makes full redraw of diagram contents reevaluating all options.
	
	Parameters:
	    updateMode: This parameter defines severaty of update <primitives.common.UpdateMode>. 
	    For example <primitives.common.UpdateMode.Refresh> updates only 
		items and selection reusing existing elements where ever it is possible.

    See also:
        <primitives.common.UpdateMode>

    Default:
        <primitives.common.UpdateMode.Recreate>
    */

	/*
    Property: itemTitleFirstFontColor
    This property customizes default template title font color. 
	Item background color sometimes play a role of logical value and 
	can vary over a wide range, so as a result title having 
	default font color may become unreadable. Widgets selects the best font color 
	between this option and <primitives.famdiagram.Config.itemTitleSecondFontColor>.

    See Also:
		<primitives.famdiagram.ItemConfig.itemTitleColor>
		<primitives.famdiagram.Config.itemTitleSecondFontColor>
		<primitives.common.highestContrast>

    */
	this.itemTitleFirstFontColor = "#ffffff"/*primitives.common.Colors.White*/;

	/*
	Property: itemTitleSecondFontColor
	Default template title second font color.
    */
	this.itemTitleSecondFontColor = "#000080"/*primitives.common.Colors.Navy*/;

	/*
    Property: linesColor
        Connectors lines color. Connectors are basic connections betwen chart items 
        defining their logical relationships, don't mix with connector annotations. 
    */
	this.linesColor = "#c0c0c0"/*primitives.common.Colors.Silver*/;

	/*
    Property: linesWidth
        Connectors lines width.
    */
	this.linesWidth = 1;

    /*
    Property: linesType
        Connectors line pattern.

    Default:
        <primitives.common.LineType.Solid>
    */
	this.linesType = 0/*primitives.common.LineType.Solid*/;

    /*
    Property: linesPalette
        This collection contains elements of type PaletteItemConfig. It is used to draw connector lines between families in different styles. 
        It is similar concept to regular line chart having lines intersections. 
        If this collection is empty then default linesColor, linesWidth and linesType are used for all connector lines.
    
    See Also:
        <primitives.famdiagram.PaletteItemConfig>
    */
	this.linesPalette = [];

	/*
	Property: showCallout
		This option controls callout visibility for dotted items. 

	Default:
	    true
	*/
	this.showCallout = true;

	/*
	Property: defaultCalloutTemplateName
		This is template name used to render callouts for dotted items. 
		Actual callout template name is defined by following sequence:
		<primitives.famdiagram.ItemConfig.calloutTemplateName> 
		<primitives.famdiagram.ItemConfig.templateName>
		<primitives.famdiagram.Config.defaultCalloutTemplateName>
		<primitives.famdiagram.Config.defaultTemplateName>


	See Also:
		<primitives.famdiagram.Config.templates> collection property.

	Default:
	    null
	*/
	this.defaultCalloutTemplateName = null;

	/*
    Property: calloutfillColor
        Annotation callout fill color.
    */
	this.calloutfillColor = "#000000";

	/*
    Property: calloutBorderColor
        Annotation callout border color.
    */
	this.calloutBorderColor = null;

	/*
    Property: calloutOffset
        Annotation callout offset.
    */
	this.calloutOffset = 4;

	/*
    Property: calloutCornerRadius
        Annotation callout corner radius.
    */
	this.calloutCornerRadius = 4;

	/*
    Property: calloutPointerWidth
        Annotation callout pointer base width.
    */
	this.calloutPointerWidth = "10%";

	/*
    Property: calloutLineWidth
        Annotation callout border line width.
    */
	this.calloutLineWidth = 1;

	/*
    Property: calloutOpacity
        Annotation callout opacity.
    */
	this.calloutOpacity = 0.2;

	/*
    Property: buttonsPanelSize
        User buttons panel size.
    */
	this.buttonsPanelSize = 28;

	/*
    Property: groupTitlePanelSize
        Group title panel size.
    */
	this.groupTitlePanelSize = 24;

	/*
    Property: checkBoxPanelSize
        Selection check box panel size.
    */
	this.checkBoxPanelSize = 24;

	this.distance = 3;

	/*
	Property: minimumScale
		Minimum CSS3 scale transform. Available on mobile safary only.
	*/
	this.minimumScale = 0.5;

	/*
	Property: maximumScale
		Maximum CSS3 scale transform. Available on mobile safary only.
	*/
	this.maximumScale = 1;

	/*
	Property: showLabels
		This option controls items labels visibility. Labels are displayed in form of divs having text inside, long strings are wrapped inside of them. 
		User can control labels position relative to its item. Chart does not preserve space for labels, 
		so if they overlap each other then horizontal or vertical intervals between rows and items shoud be manually increased.
    
	Auto - depends on available space.
    True - always shown.
    False - hidden.

    See Also:
		<primitives.famdiagram.ItemConfig.label>
		<primitives.famdiagram.Config.labelSize>
		<primitives.famdiagram.Config.normalItemsInterval>
		<primitives.famdiagram.Config.dotItemsInterval>
		<primitives.famdiagram.Config.lineItemsInterval>
		<primitives.famdiagram.Config.normalLevelShift>
		<primitives.famdiagram.Config.dotLevelShift>
		<primitives.famdiagram.Config.lineLevelShift>

	Default:
	    <primitives.common.Enabled.Auto>
	*/
	this.showLabels = 0/*primitives.common.Enabled.Auto*/;

	/*
	Property: labelSize
		Defines label size. It is needed to avoid labels overlapping. If one label overlaps another label or item it will be hidden. 
		Label string is wrapped when its length exceeds available width.

	Default:
		new <primitives.common.Size>(80, 24);
	*/
	this.labelSize = new primitives.common.Size(80, 24);

	/*
	Property: labelOffset
		Defines label offset from dot in pixels.

	Default:
		1;
	*/
	this.labelOffset = 1;

	/*
	Property: labelOrientation
		Defines label orientation. 

    See Also:
    <primitives.text.TextOrientationType>

	Default:
		<primitives.text.TextOrientationType.Horizontal>
	*/
	this.labelOrientation = 0/*primitives.text.TextOrientationType.Horizontal*/;

	/*
	Property: labelPlacement
		Defines label placement relative to its dot. 
		Label is aligned to opposite side of its box.

	See Also:
	<primitives.common.PlacementType>

	Default:
		<primitives.common.PlacementType.Top>
	*/
	this.labelPlacement = 1/*primitives.common.PlacementType.Top*/;

	/*
	Property: labelFontSize
		Label font size. 

	Default:
		10px
*/
	this.labelFontSize = "10px";

	/*
	    Property: labelFontFamily
			Label font family. 

		Default:
			"Arial"
    */
	this.labelFontFamily = "Arial";

	/*
	    Property: labelColor
			Label color. 

		Default:
			primitives.common.Colors.Black
    */
	this.labelColor = "#000000"/*primitives.common.Colors.Black*/;

	/*
	    Property: labelFontWeight
			Font weight: normal | bold

		Default:
			"normal"
    */
	this.labelFontWeight = "normal";

	/*
    Property: labelFontStyle
        Font style: normal | italic
        
    Default:
        "normal"
    */
	this.labelFontStyle = "normal";

	/*
	Property: enablePanning
		Enable chart panning with mouse drag & drop for desktop browsers.

	Default:
		true
	*/
	this.enablePanning = true;
};
/*
    Class: primitives.famdiagram.ConnectorAnnotationConfig
	    Options class. Populate annotation collection with instances of this objects to draw connector between two items.
    
    See Also:
	    <primitives.famdiagram.Config.annotations>
*/
primitives.famdiagram.ConnectorAnnotationConfig = function (arg0, arg1) {
    var property;

    /*
    Property: annotationType
        Connector shape type. Set this property to its default value if you create connector annotation without this prototype object.

    Default:
        <primitives.common.AnnotationType.Connector>
    */
    this.annotationType = 0/*primitives.common.AnnotationType.Connector*/;

    /*
    Property: zOrderType
        Defines connector Z order placement relative to chart items.

    Default:
        <primitives.common.ZOrderType.Foreground>
    */
    this.zOrderType = 2/*primitives.common.ZOrderType.Foreground*/;

    /*
	Property: fromItem 
	    Reference to from item in hierarchy.
	See Also:
	    <primitives.famdiagram.ItemConfig.id>
    */
    this.fromItem = null;

    /*
    Property: toItem 
        Reference to from item in hierarchy.
	See Also:
	    <primitives.famdiagram.ItemConfig.id>
    */
    this.toItem = null;

    /*
    Property: connectorShapeType
        Connector shape type. 

    Default:
        <primitives.common.ConnectorShapeType.OneWay>
    */
    this.connectorShapeType = 0/*primitives.common.ConnectorShapeType.OneWay*/;

    /*
    Property: offset
        Connector's from and to points offset off the rectangles side. Connectors connection points can be outside of rectangles and inside for negative offset value.
    See also:
        <primitives.common.Thickness>
    */
    this.offset = new primitives.common.Thickness(0, 0, 0, 0);

    /*
    Property: lineWidth
        Border line width. 
    */
    this.lineWidth = 2;

    /*
    Property: color
        Connector's color.
    
    Default:
        <primitives.common.Colors.Black>
    */
    this.color = "#000000"/*primitives.common.Colors.Black*/;

    /*
    Property: lineType
        Connector's line pattern.

    Default:
        <primitives.common.LineType.Solid>
    */
    this.lineType = 0/*primitives.common.LineType.Solid*/;

    /*
    Property: selectItems
        Make items shown always shown in normal state.
    */
    this.selectItems = true;

    /*
    Property: label
        Annotation label text. Label styled with css class name "bp-connector-label".
    */
    this.label = null;

    /*
	Property: labelSize
		Annotation label size.

	Default:
		new <primitives.common.Size>(60, 30);
	*/
    this.labelSize = new primitives.common.Size(60, 30);

    switch (arguments.length) {
        case 1:
            for (property in arg0) {
                if (arg0.hasOwnProperty(property)) {
                    this[property] = arg0[property];
                }
            }
            break;
        case 2:
            this.fromItem = arg0;
            this.toItem = arg1;
            break;
    }
};
/*
    Class: primitives.famdiagram.ItemConfig
		Defines item in family chart hierarchy. 
		User is supposed to create hierarchy of this items and assign it to <primitives.famdiagram.Config.items> collection property.
		Widget contains some generic properties used in default item template, 
		but user can add as many custom properties to this class as needed. 
		Just be careful and avoid widget malfunction.

    See Also:
		<primitives.famdiagram.Config.items>
*/
primitives.famdiagram.ItemConfig = function (arg0, arg1, arg2, arg3, arg4) {
    var property;
    /*
	Property: id
	Unique item id.
    */
    this.id = null;

    /*
    Property: parents
    Collection of parent id's. If parents collection is empty [] then item placed as a root item.
    */
    this.parents = [];

	/*
	Property: title
	Default template title property.
    */
	this.title = null;

	/*
	Property: description
	Default template description element.
    */
	this.description = null;

	/*
	Property: image
	Url to image. This property is used in default template.
    */
	this.image = null;

    /*
    Property: context
    User context object.
    */
	this.context = null;

	/*
	Property: itemTitleColor
	Default template title background color.
    */
	this.itemTitleColor = "#4169e1"/*primitives.common.Colors.RoyalBlue*/;

	/*
    Property: groupTitle
    Auxiliary group title property. Displayed vertically on the side of item.
    */
	this.groupTitle = null;

	/*
    Property: groupTitleColor
    Group title background color.
    */
	this.groupTitleColor = "#4169e1"/*primitives.common.Colors.RoyalBlue*/;

	/*
    Property: isVisible
        If it is true then item is shown and selectable in hierarchy. 
		If item is hidden and it has visible children then only connector line is drawn instead of it.

    True - Item is shown.
    False - Item is hidden.

    Default:
		true
    */
	this.isVisible = true;

	/*
    Property: hasSelectorCheckbox
        If it is true then selection check box is shown for the item. 
		Selected items are always shown in normal form, so if item is 
		selected then its selection check box is visible and checked.

    Auto - Depends on <primitives.famdiagram.Config.hasSelectorCheckbox> setting.
    True - Selection check box is visible.
    False - No selection check box.

    Default:
    <primitives.common.Enabled.Auto>
    */
	this.hasSelectorCheckbox = 0/*primitives.common.Enabled.Auto*/;

	/*
    Property: hasButtons
        This option controls buttons panel visibility. 

    Auto - Depends on <primitives.famdiagram.Config.hasButtons> setting.
    True - Has buttons panel.
    False - No buttons panel.

    Default:
    <primitives.common.Enabled.Auto>
    */
	this.hasButtons = 0/*primitives.common.Enabled.Auto*/;

	/*
	Property: templateName
		This is template name used to render this item.

		See Also:
		<primitives.famdiagram.TemplateConfig>
		<primitives.famdiagram.Config.templates> collection property.
    */
	this.templateName = null;

	/*
	Property: showCallout
		This option controls items callout visibility.

	Auto - depends on <primitives.famdiagram.Config.showCallout> option
	True - shown
	False - hidden

	Default:
		<primitives.common.Enabled.Auto>
	*/
	this.showCallout = 0/*primitives.common.Enabled.Auto*/;

	/*
	Property: calloutTemplateName
		This is template name used to render callout for dotted item. 
		Actual callout template name is defined by following sequence:
		<primitives.famdiagram.ItemConfig.calloutTemplateName> 
		<primitives.famdiagram.ItemConfig.templateName>
		<primitives.famdiagram.Config.defaultCalloutTemplateName>
		<primitives.famdiagram.Config.defaultTemplateName>

	See Also:
		<primitives.famdiagram.Config.templates> collection property.
	Default:
		null
	*/
	this.calloutTemplateName = null;

	/*
	Property: label
	Items label text.
	*/
	this.label = null;

	/*
	Property: showLabel
		This option controls items label visibility. Label is displayed in form of div having text inside, long string is wrapped inside of it. 
		User can control labels position relative to its item. Chart does not preserve space for label.

	Auto - depends on <primitives.famdiagram.Config.labelOrientation> setting.
	True - always shown.
	False - hidden.

	See Also:
	<primitives.famdiagram.ItemConfig.label>
	<primitives.famdiagram.Config.labelSize>

	Default:
		<primitives.common.Enabled.Auto>
	*/
	this.showLabel = 0/*primitives.common.Enabled.Auto*/;

	/*
	Property: labelSize
		Defines label size. It is needed to avoid labels overlapping. If one label overlaps another label or item it will be hidden. 
		Label string is wrapped when its length exceeds available width. 
		By default it is equal to charts <primitives.famdiagram.Config.labelSize>.

	See Also:
		<primitives.common.Size>
	Default:
		null;
	*/
	this.labelSize = null;

	/*
	Property: labelOrientation
		Defines label orientation. 
		In default <primitives.text.TextOrientationType.Auto> mode it depends on chart <primitives.famdiagram.Config.labelOrientation> setting.

    See Also:
	<primitives.famdiagram.Config.labelOrientation>
    <primitives.text.TextOrientationType>

	Default:
		<primitives.text.TextOrientationType.Auto>
	*/
	this.labelOrientation = 3/*primitives.text.TextOrientationType.Auto*/;

	/*
	Property: labelPlacement
		Defines label placement relative to the item. 
		In default <primitives.common.PlacementType.Auto> mode it depends on chart <primitives.famdiagram.Config.labelPlacement> setting.

	See Also:
		<primitives.famdiagram.Config.labelPlacement>
		<primitives.common.PlacementType>

	Default:
		<primitives.common.PlacementType.Auto>
	*/
	this.labelPlacement = 0/*primitives.common.PlacementType.Auto*/;

	switch (arguments.length) {
	    case 1:
	        for (property in arg0) {
	            if (arg0.hasOwnProperty(property)) {
	                this[property] = arg0[property];
	            }
	        }
	        break;
	    case 5:
	        this.id = arg0;
	        this.parent = arg1;
			this.title = arg2;
			this.description = arg3;
			this.image = arg4;
			break;
	}
};
/*
    Class: primitives.famdiagram.PaletteItemConfig
		This class is used to define cross family connectors styles. 
        Multi-parent charts are supposed to have multiple cross hierarchy connectors, so in order to trace them more easely on chart
        every connector may have separate style. It is the same strategy as for visualization of regular line charts.

    See Also:
		<primitives.famdiagram.Config.linesPalette>
*/
primitives.famdiagram.PaletteItemConfig = function (arg0, arg1, arg2) {
    var property;

    /*
    Property: lineColor
        Line color.

    Default:
        <primitives.common.Colors.Silver>
    */
    this.lineColor = "#c0c0c0"/*primitives.common.Colors.Silver*/;

    /*
    Property: lineWidth
        Line width.
    Default:
        1
    */
    this.lineWidth = 1;

    /*
    Property: lineType
        Line pattern.

    Default:
        <primitives.common.LineType.Solid>
    */
    this.lineType = 0/*primitives.common.LineType.Solid*/;

	switch (arguments.length) {
	    case 1:
	        for (property in arg0) {
	            if (arg0.hasOwnProperty(property)) {
	                this[property] = arg0[property];
	            }
	        }
	        break;
	    case 3:
	        this.lineColor = arg0;
	        this.lineWidth = arg1;
	        this.lineType = arg2;
			break;
	}
};
/*
    Class: primitives.famdiagram.ShapeAnnotationConfig
	    Options class. Populate annotation collection with instances of this objects to draw shape benith or on top of several items.
        Shape is drawn as rectangular area.
    See Also:
	    <primitives.famdiagram.Config.annotations>
*/
primitives.famdiagram.ShapeAnnotationConfig = function (arg0) {
    var property;
    /*
    Property: annotationType
        Connector shape type. Set this property to its default value if you create shape annotation without this prototype object.

    Default:
        <primitives.common.AnnotationType.Connector>
    */
    this.annotationType = 1/*primitives.common.AnnotationType.Shape*/;

    /*
    Property: zOrderType
        Defines shape Z order placement relative to chart items. Chart select the best order depending on shape type.

    Default:
        <primitives.common.ZOrderType.Auto>
    */
    this.zOrderType = 0/*primitives.common.ZOrderType.Auto*/;

    /*
	Property: items 
	    Array of items ids in hierarchy.
	See Also:
	    <primitives.famdiagram.ItemConfig.id>
    */
    this.items = [];

    /*
    Property: shapeType
        Shape type. 

    Default:
        <primitives.common.ShapeType.Rectangle>
    */
    this.shapeType = 0/*primitives.common.ShapeType.Rectangle*/;

    /*
    Property: offset
        Connector's from and to points offset off the rectangles side. Connectors connection points can be outside of rectangles and inside for negative offset value.
    See also:
        <primitives.common.Thickness>
    */
    this.offset = new primitives.common.Thickness(0, 0, 0, 0);

    /*
    Property: lineWidth
        Border line width. 
    */
    this.lineWidth = 2;

    /*
    Property: cornerRadius
        Body corner radius in percents or pixels. For applicable shapes only.
    */
    this.cornerRadius = "10%";

    /*
    Property: opacity
        Background color opacity. For applicable shapes only.
    */
    this.opacity = 1;

    /*
    Property: borderColor
        Shape border line color.
    
    Default:
        null
    */
    this.borderColor = null;

    /*
    Property: fillColor
        Fill Color. 

    Default:
        null
    */
    this.fillColor = null;

    /*
    Property: lineType
        Connector's line pattern.

    Default:
        <primitives.common.LineType.Solid>
    */
    this.lineType = 0/*primitives.common.LineType.Solid*/;

    /*
    Property: selectItems
        Make items shown always shown in normal state.
    */
    this.selectItems = false;

    /*
    Property: label
        Annotation label text. Label styled with css class name "bp-connector-label".
    */
    this.label = null;

    /*
	Property: labelSize
		Annotation label size.

	Default:
		new <primitives.common.Size>(60, 30);
	*/
    this.labelSize = new primitives.common.Size(60, 30);

    /*
    Property: labelPlacement
        Defines label placement relative to the shape. 

    See Also:
        <primitives.famdiagram.Config.labelPlacement>
        <primitives.common.PlacementType>

    Default:
        <primitives.common.PlacementType.Auto>
    */
    this.labelPlacement = 0/*primitives.common.PlacementType.Auto*/;

    /*
    Property: labelOffset
        Defines label offset from shape in pixels.

    Default:
        4;
    */
    this.labelOffset = 4;

    switch (arguments.length) {
        case 1:
            if (arg0 !== null) {
                if (arg0 instanceof Array) {
                    this.items = arg0;
                } else if (typeof arg0 == "object") {
                    for (property in arg0) {
                        if (arg0.hasOwnProperty(property)) {
                            this[property] = arg0[property];
                        }
                    }
                }
            }
            break;
    }
};
primitives.famdiagram.Controller = function () {
	this.widgetEventPrefix = "famdiagram";

	this.options = new primitives.famdiagram.Config();

    /* base diagram is supposed to work for both orgDiagram & famDiagram widgets so following propertyies set to its default values and used in orgDiagram only */
	this.options.childrenPlacementType = 2/*primitives.common.ChildrenPlacementType.Horizontal*/;
	this.options.leavesPlacementType = 2/*primitives.common.ChildrenPlacementType.Horizontal*/;
	this.options.horizontalAlignment = 0/*primitives.common.HorizontalAlignmentType.Center*/;
	this.options.connectorType = 0/*primitives.common.ConnectorType.Squared*/;
	this.options.maximumColumnsInMatrix = 6;
	this.options.highlightLinesColor = "#ff0000"/*primitives.common.Colors.Red*/;
	this.options.highlightLinesWidth = 1;
	this.options.highlightLinesType = 0/*primitives.common.LineType.Solid*/;
};

primitives.famdiagram.Controller.prototype = new primitives.orgdiagram.BaseController();

primitives.famdiagram.Controller.prototype._getEventArgs = function (oldTreeItem, newTreeItem, name) {
    var result = new primitives.famdiagram.EventArgs(),
        offset, index, len, itemConfig;

    if (oldTreeItem != null && oldTreeItem.itemConfig.id != null) {
        result.oldContext = this._treeItemConfigs[oldTreeItem.itemConfig.id];
    }

    if (newTreeItem != null && newTreeItem.itemConfig.id != null) {
        result.context = this._treeItemConfigs[newTreeItem.itemConfig.id];

        if (newTreeItem.itemConfig.parents != null) {
            for (index = 0, len = newTreeItem.itemConfig.parents.length; index < len; index += 1) {
                itemConfig = this._treeItemConfigs[newTreeItem.itemConfig.parents[index]];
                if(itemConfig != null) {
                    result.parentItems.push(itemConfig);
                }
            };
        };

        placeholderOffset = this.m_placeholder.offset();
        offset = this.element.offset();
        result.position = new primitives.common.Rect(newTreeItem.actualPosition)
                .translate(placeholderOffset.left, placeholderOffset.top)
                .translate(-offset.left, -offset.top);
    }

    if (name != null) {
        result.name = name;
    }

    return result;
};
/*  Her is a list of major steps family chart makes in order to create organizational chart hiararchy 
    it creates couple of extra collections for cross hierarchy connections
    1. Scan options and create hash tables:
        user ItemConfig-s hash: _treeItemConfigs by ItemConfig.id
        family items hash _famItems
            FamilyItem has logicalChildren & logicalParents collections containing ids of referenced family items
    2. Scan family items hash and populate logicalChildren collections
    3. Find relative level for every family items.
    4. Align parents close to their children. Shift items down so items have no gaps between levels.
    5. Fill in missed items between levels. So thats way we have invisible items between parent/child family items if they have gap between levels.
        Such invisible family items have isVisible option set to false.
    6. Extract families into _families array of type FamilyItem. We find in family chart for every item total number of descendants and then extract 
        item having maximum number of them including spouses (limited partners) Then we find maximum hierarchy out of 
        remaining family items and extract it into another family utill we extract all families. 
            _orgChildren - When we extract families we store links to already extracted children as _orgChildren hash
            _orgPartners - When we extract families we store links to parents in other branches having the same children of 
            some already extracted item as partner in _orgPartners hash
        These two hash tables used to create links collections between families

        The following collections define our org hierarchy used to render org chart in base chart controller.
            _orgItems
            _orgItemChildren
            _orgItemRoots
    7. Use links in families to build family graph
    8. Find maximum spanning tree of family graph
    9. Since spanning tree is the tree we calculate number of descendants in every branch. So when we join families into one 
        org chart we sort them taking first child family having maximum number of links to its parent family
        sortedFamilies collection
    10. Using sortedFamilies collection we merge roots of families back to primary org chart. The rule of that backword merging is 
        to find ancestor in target tree having level less then root item of merged family.
        this is done without extra collection creation via making changes in 
            _orgItems
            _orgItemChildren
        If family has no links its root added to 
            _orgItemRoots 
*/
primitives.famdiagram.Controller.prototype._createOrgTree = function () {
    var index, len,
        index2, len2,
        index3, len3,
        itemConfig, famItem,
        childItem,
        familiesGraph = {}, /* Hash where Key: family id, Value: {} Hash where key: family id, value: number of connections - weight of connection */
        link, links,
        fromFamily,
        toFamily,
        sortedFamilies = [], sortedFamiliesHash,
        attachedFamilies,
        userItem,
        itemId, childItemId,
        extFamItems,
        logicalParents, logicalParent, grandParent,
        childIndex,
        levelIndex,
        newFamItem,
        familyId,
        chartRootItem,
        children, subChildren,
        family, siblingItem, subFamily,
        positions,
        familyRootItem,
        fromItem,
        toItem,
        isOnRight,
        rootItem,
        logicalChild, logicalChildren,
        duplicates,
        parentsSignatures, parentsSignature,
        newLogicalChildren,
        mergeToItem,
        spanningTree,
        newLogicalChildrenHash,
        itemsAtLevels, itemsAtLevel, minimumLevel, maximumLevel, childrenLevels,
        id, childrenLevel;

    this.showInvisibleSubTrees = true; /* in regular org diagram we hide branch if it contains only invisible nodes, 
        in the family chart we use invisible items to draw connectors across multiple levels */

    this.showElbowDots = true; /* in regular org chart we don;t have situations when connector lines cross, but we have such situations in 
        family tree so we need extra visual attribute to distinguish intersections betwen connectors */

    // User ItemConfigs
    this._treeItemConfigs = {}; /* Hash where key: primitives.famdiagram.ItemConfig.id and value: ItemConfig*/

    // Family Chart definition - this is source of chart
    this._famItems = {}; /* Hash where key: FamilyItem.id and value: FamilyItem */
    this._famItemsNonExtracted = {}; /* Hash where key: FamilyItem.id and value: FamilyItem*/

    this.itemByChildrenKey = {};

    this._orgPartners = {}; /* this is items which share the same children with this item */
    this._orgChildren = {}; /* this is children items which has different parents */

    this._families = [];

    // Organizational chart definition, these are output of this procedure
    this._orgItems = {};  /* primitives.orgdiagram.OrgItem */
    this._orgItemChildren = {}; /* key: primitives.orgdiagram.OrgItem.id value: array of primitives.orgdiagram.OrgItem.id having  OrgItem.parent equal to key */
    this._orgItemRoots = []; // primitives.orgdiagram.OrgItem


    this.maximumFamItemId = 0;
    this.minimumLevel = null;
    this.maximumLevel = null;
    
    if (this.options.items.length > 0) {
        /* Create TreeItem's hash */
        for (index = 0, len = this.options.items.length; index < len; index+=1) {
            userItem = this.options.items[index];

            if (userItem != null) {
                this._treeItemConfigs[userItem.id] = userItem;

                famItem = new primitives.famdiagram.FamilyItem();
                famItem.id = userItem.id;
                famItem.itemConfig = userItem;

                this._famItems[famItem.id] = famItem;
                this._famItemsNonExtracted[famItem.id] = famItem;

                this.maximumFamItemId = Math.max(this.maximumFamItemId, userItem.id);
            }
        }

        /* populate logical children & parents of family items  */
        for (itemId in this._famItems) {
            if (this._famItems.hasOwnProperty(itemId)) {
                famItem = this._famItems[itemId];
                famItem.logicalParents = famItem.itemConfig.parents != null ? famItem.itemConfig.parents.slice(0) : [];
                duplicates = {};
                for (index = 0, len = famItem.logicalParents.length; index < len; index+=1) {
                    childItemId = famItem.logicalParents[index];
                    if (this._famItems.hasOwnProperty(childItemId) && childItemId != famItem.id && !duplicates.hasOwnProperty(childItemId)) {
                        this._famItems[childItemId].logicalChildren.push(famItem.id);
                        duplicates[childItemId] = true;
                    } else {
                        /* if item does not exists we remove it silently */
                        famItem.logicalParents.splice(primitives.common.indexOf(famItem.logicalParents, childItemId), 1);
                    }
                }
            }
        }

        /* Distribute this._famItems by levels. */
        for (index = 0, len = this.options.items.length; index < len; index+=1) {
            itemConfig = this.options.items[index];
            famItem = this._famItems[itemConfig.id];
            if (famItem.level == null) {
                famItem.level = 0;
                this._sortItemsBylevels(famItem);
            }
        }

        /* Align parents close to their children */
        /* collect items at levels*/
        itemsAtLevels = []; /* array contains collection of arrays having items ids  for every level*/
        minimumLevel = 0;
        maximumLevel = 0;
        for (index = 0, len = this.options.items.length; index < len; index += 1) {
            itemConfig = this.options.items[index];
            famItem = this._famItems[itemConfig.id];

            minimumLevel = Math.min(minimumLevel, famItem.level);
            maximumLevel = Math.max(maximumLevel, famItem.level);

            if (itemsAtLevels[famItem.level] == null) {
                itemsAtLevels[famItem.level] = [itemConfig.id];
            } else {
                itemsAtLevels[famItem.level].push(itemConfig.id);
            }
        }

        /* count maximum level of children for every item  */
        childrenLevels = {}; /* hash keeps minimum children level for itemConfig.id */
        for (index = maximumLevel; index >= minimumLevel; index-=1) {
            itemsAtLevel = itemsAtLevels[index];

            for (index2 = 0, len2 = itemsAtLevel.length; index2 < len2; index2 += 1) {
                id = itemsAtLevel[index2];
                famItem = this._famItems[id];

                if (famItem.logicalChildren.length > 0) {
                    childrenLevel = childrenLevels[id];

                    if (famItem.level < childrenLevel - 1) {
                        famItem.level = childrenLevel - 1;
                    }
                }
                for (index3 = 0, len3 = famItem.logicalParents.length; index3 < len3; index3 += 1) {
                    logicalParent = famItem.logicalParents[index3];
                    if (!childrenLevels.hasOwnProperty(logicalParent)) {
                        childrenLevels[logicalParent] = famItem.level;
                    } else {
                        childrenLevels[logicalParent] = Math.min(childrenLevels[logicalParent], famItem.level);
                    }
                }
            }
        }


        /* Fill in items between parent/child relations having gaps in levels */
        for (index = 0, len = this.options.items.length; index < len; index+=1) {
            itemConfig = this.options.items[index];
            famItem = this._famItems[itemConfig.id];

            /* extend children down */
            logicalChildren = famItem.logicalChildren.slice(0);
            for (index2 = 0, len2 = logicalChildren.length; index2 < len2; index2+=1) {
                childItem = this._famItems[logicalChildren[index2]];

                if (famItem.level + 1 < childItem.level) {

                    /* disconnect childItem from all of its parents */
                    logicalParents = childItem.logicalParents;
                    for (index3 = 0, len3 = childItem.logicalParents.length; index3 < len3; index3+=1) {
                        logicalParent = this._famItems[childItem.logicalParents[index3]];

                        childIndex = primitives.common.indexOf(logicalParent.logicalChildren, childItem.id);
                        logicalParent.logicalChildren.splice(childIndex, 1);
                    }
                    childItem.logicalParents = [];

                    /* create extension items between famItem and its childItem */
                    extFamItems = [];
                    for (levelIndex = famItem.level + 1; levelIndex < childItem.level; levelIndex+=1) {
                        this.maximumFamItemId+=1;

                        newFamItem = new primitives.famdiagram.FamilyItem();
                        newFamItem.id = this.maximumFamItemId;
                        newFamItem.level = levelIndex;
                        newFamItem.isVisible = false;

                        this._famItems[newFamItem.id] = newFamItem;
                        this._famItemsNonExtracted[newFamItem.id] = newFamItem;

                        extFamItems[levelIndex] = newFamItem;

                        logicalParents.push(newFamItem.id);
                    }

                    /* assign parents back to extention items or actual childItem */
                    extFamItems[childItem.level] = childItem;
                    for (index3 = 0, len3 = logicalParents.length; index3 < len3; index3+=1) {
                        logicalParent = this._famItems[logicalParents[index3]];

                        if (logicalParent.level <= famItem.level) {
                            extFamItems[famItem.level + 1].logicalParents.push(logicalParent.id);
                            logicalParent.logicalChildren.push(extFamItems[famItem.level + 1].id);
                        } else {
                            extFamItems[logicalParent.level + 1].logicalParents.push(logicalParent.id);
                            logicalParent.logicalChildren.push(extFamItems[logicalParent.level + 1].id);
                        }
                    }
                }
            }

            logicalChildren = famItem.logicalChildren.slice(0);
            /* merge extension items having the same parents */
            while (logicalChildren.length > 0) {
                parentsSignatures = {};
                newLogicalChildren = [];
                for (index2 = 0, len2 = logicalChildren.length; index2 < len2; index2 += 1) {
                    childItem = this._famItems[logicalChildren[index2]];

                    if (childItem.isVisible == false) {
                        parentsSignature = childItem.logicalParents.sort().toString();
                        if (!primitives.common.isNullOrEmpty(parentsSignature)) {
                            if (parentsSignatures.hasOwnProperty(parentsSignature)) {
                                /* merge invisible items */
                                mergeToItem = parentsSignatures[parentsSignature];

                                /* remove childItem from all its parents */
                                logicalParents = childItem.logicalParents;
                                for (index3 = 0, len3 = childItem.logicalParents.length; index3 < len3; index3 += 1) {
                                    logicalParent = this._famItems[childItem.logicalParents[index3]];

                                    childIndex = primitives.common.indexOf(logicalParent.logicalChildren, childItem.id);
                                    logicalParent.logicalChildren.splice(childIndex, 1);
                                }
                                childItem.logicalParents = [];

                                /* remove childItem from all its children */
                                for (index3 = 0, len3 = childItem.logicalChildren.length; index3 < len3; index3 += 1) {
                                    logicalChild = this._famItems[childItem.logicalChildren[index3]];

                                    childIndex = primitives.common.indexOf(logicalChild.logicalParents, childItem.id);
                                    logicalChild.logicalParents.splice(childIndex, 1);

                                    /* add mergeToItem as new parent */

                                    logicalChild.logicalParents.push(mergeToItem.id);
                                    mergeToItem.logicalChildren.push(logicalChild.id);
                                }

                                /* remove childItem */
                                delete this._famItems[childItem.id];
                                delete this._famItemsNonExtracted[childItem.id];

                                
                                newLogicalChildren = newLogicalChildren.concat(mergeToItem.logicalChildren.slice(0));
                            } else {
                                parentsSignatures[parentsSignature] = childItem;
                            }
                        }
                    }
                }

                logicalChildren = [];
                newLogicalChildrenHash = {};
                for(index3 = 0, len3 = newLogicalChildren.length; index3 < len3; index3+=1) {
                    childIndex = newLogicalChildren[index3];
                    if (!newLogicalChildrenHash.hasOwnProperty(childIndex)) {
                        logicalChildren.push(childIndex);
                        newLogicalChildrenHash[childIndex] = true;
                    }
                }
            }
        }

        /* Extract families */
        this.properties = [
            'title', 'description', 'image',
            'itemTitleColor', 'groupTitle', 'groupTitleColor',
            'isVisible', 'hasSelectorCheckbox', 'hasButtons',
            'templateName', 'showCallout', 'calloutTemplateName',
            'label', 'showLabel', 'labelSize', 'labelOrientation', 'labelPlacement'];
        this.defaultItemConfig = new primitives.famdiagram.ItemConfig();


        grandParent = null;
        familyId = 0;
        while ((grandParent = this._findLargestRoot()) != null) {
            family = new primitives.famdiagram.Family(familyId);
            /* _extractOrgChart method extracts hiearchy of family members starting from grandParent and takes only non extracted family items 
             * For every extracted item it assigns its familyId, it is used for building families relations graph and finding cross family links
            */
            this._extractOrgChart(family, this._famItems[grandParent]);
            this._families.push(family);
            familyId+=1;
        }

        sortedFamilies = [];
        sortedFamiliesHash = {};
        if (this._families.length > 0) {
            /* Build families graph */
            for (index = 0, len = this._families.length; index < len; index += 1) {
                family = this._families[index];

                for (index2 = 0, len2 = family.links.length; index2 < len2; index2 += 1) {
                    link = family.links[index2];



                    fromFamily = this._famItems[link.fromItem].familyId;
                    toFamily = this._famItems[link.toItem].familyId;

                    if (fromFamily != toFamily) {
                        /* from family */
                        if (!familiesGraph.hasOwnProperty(fromFamily)) {
                            familiesGraph[fromFamily] = {};
                        }
                        if (!familiesGraph[fromFamily].hasOwnProperty(toFamily)) {
                            familiesGraph[fromFamily][toFamily] = 0;
                        }
                        familiesGraph[fromFamily][toFamily] += 1;

                        /* to family */
                        if (!familiesGraph.hasOwnProperty(toFamily)) {
                            familiesGraph[toFamily] = {};
                        }
                        if (!familiesGraph[toFamily].hasOwnProperty(fromFamily)) {
                            familiesGraph[toFamily][fromFamily] = 0;
                        }
                        familiesGraph[toFamily][fromFamily] += 1;
                    }

                    this._families[toFamily].backLinks.push(new primitives.famdiagram.FamLink(link.toItem, link.fromItem));
                }
            }

            while (sortedFamilies.length < this._families.length) {
                for (index = 0, len = this._families.length; index < len; index += 1) {
                    family = this._families[index];

                    if (!sortedFamiliesHash.hasOwnProperty(family.id)) {

                        /* find maximum spanning tree of families graph*/
                        spanningTree = this._findMaximumSpanningTree(familiesGraph, family.id);

                        if (spanningTree.hasOwnProperty(family.id)) {

                            /* count number of sub families for every family in spanning tree and sorts children by it*/
                            this._countNumberOfSubFamilies(family.id, spanningTree);

                            sortedFamilies.push(family.id);
                            sortedFamiliesHash[family.id] = true;

                            children = spanningTree[family.id];
                            for (index2 = 0, len2 = children.length; index2 < len2; index2 += 1) {
                                subChildren = this._getFamilyAndItsSubFamilies(children[index2], spanningTree);
                                for (index3 = 0, len3 = subChildren.length; index3 < len3; index3 += 1) {
                                    subFamily = subChildren[index3];

                                    sortedFamilies.push(subFamily);
                                    sortedFamiliesHash[subFamily] = true;
                                }
                            }
                        } else {
                            /* family has no links to any other family so we add it as orphant */
                            sortedFamilies.push(family.id);
                            sortedFamiliesHash[family.id] = true;
                        }                        
                    }
                }
            }
        }
        
        /* create chart root */
        this.maximumFamItemId+=1;
        chartRootItem = this._createOrgItem(this.maximumFamItemId, null /*parent id*/, null, this.minimumLevel - 1, null /* userItem */);
        chartRootItem.hideParentConnection = true;
        chartRootItem.hideChildrenConnection = true;
        chartRootItem.title = "root";
        chartRootItem.isVisible = false;


        this._orgItemRoots.push(chartRootItem);

        /* Place families roots to organizational chart */
        attachedFamilies = {};
        for (index = 0, len = sortedFamilies.length; index < len; index+=1) {
            family = this._families[sortedFamilies[index]];

            rootItem = chartRootItem;

            isOnRight = true;
            links = family.links.concat(family.backLinks);
            for (index2 = 0; index2 < links.length; index2+=1) {
                link = links[index2];

                toItem = this._orgItems[link.toItem];
                fromItem = this._orgItems[link.fromItem];
                if (attachedFamilies[toItem.familyId] == true) {
                    familyRootItem = family.items[0];
                    rootItem = toItem;
                    positions = [];
                    while (rootItem.level >= familyRootItem.level) {
                        siblingItem = rootItem;
                        rootItem = this._orgItems[rootItem.parent];
                        children = this._orgItemChildren[rootItem.id];
                        positions.push(primitives.common.indexOf(children, siblingItem) > children.length / 2.0);
                    }
                    isOnRight = positions[Math.max(0, positions.length - 2)];
                    break;
                }
            }

            this._attachFamilyToOrgChart(rootItem, siblingItem, family, isOnRight);

            attachedFamilies[family.id] = true;
        }
    }
};

primitives.famdiagram.Controller.prototype._getFamilyAndItsSubFamilies = function (item, spanningTree) {
    var result = [item],
        children = spanningTree[item],
        index, len,
        childFamily;
    if (children != null) {
        for (index = 0, len = children.length; index < len; index+=1) {
            childFamily = children[index];
            result = result.concat(this._getFamilyAndItsSubFamilies(childFamily, spanningTree));
        }
    }
    return result;
};

primitives.famdiagram.Controller.prototype._countNumberOfSubFamilies = function (item, spanningTree) {
    var family = this._families[item],
        index, len,
        children,
        priorities = {},
        childFamily;
    family.familyPriority = 1;
    children = spanningTree[item];
    if (children != null) {
        for (index = 0, len = children.length; index < len; index+=1) {
            childFamily = children[index];
            priorities[childFamily] = this._countNumberOfSubFamilies(childFamily, spanningTree);
            family.familyPriority += priorities[childFamily];
        }

        children.sort(function (a, b) { return priorities[a] - priorities[b]; });
    }
    return family.familyPriority;
};

primitives.famdiagram.Controller.prototype._sortFamilies = function (a, b) {
    return this._families[a].familyPriority - this._families[b].familyPriority;
};

primitives.famdiagram.Controller.prototype._findMaximumSpanningTree = function (graph, startNode) {
    /* Graph */
    var result = {}, /* hash table having key: parent family id, value: [] array of chilren id-s */
        margin = {}, marginKey,
        itemsToRemove = [], /* if margin item has no neighbours to expand we remove it from margin*/
        hasNeighbours,
        parents = {}, /* if parent for item is set then it was laready visited */
        marginLength = 0, /* curent margin length */
        nextMarginKey,
        nextMarginWeight,
        nextMarginParent,
        neighbours, neighbourKey, neighbourWeight,
        index, len;

    /* add start node to margin */
    margin[startNode] = true;
    marginLength += 1;

    /* add startNode to result tree */
    parents[startNode] = null;

    /* search graph */
    while (marginLength > 0) {
        itemsToRemove = [];
        nextMarginKey = null;
        nextMarginWeight = 0;
        nextMarginParent = null;
        /* itterate neighbours of every node on margin */
        for (marginKey in margin) {
            if (margin.hasOwnProperty(marginKey)) {
                neighbours = graph[marginKey];
                hasNeighbours = false;

                for (neighbourKey in neighbours) {
                    if (neighbours.hasOwnProperty(neighbourKey) && !parents.hasOwnProperty(neighbourKey)) {
                        neighbourWeight = neighbours[neighbourKey];
                        hasNeighbours = true;

                        if (neighbourWeight > nextMarginWeight) {
                            nextMarginKey = neighbourKey;
                            nextMarginWeight = neighbourWeight;
                            nextMarginParent = marginKey;
                        }
                    }
                }

                if (!hasNeighbours) {
                    itemsToRemove.push(marginKey);
                }
            }
        }

        if (nextMarginKey == null) {
            /* no items to expand to exit*/
            break;
        } else {
            margin[nextMarginKey] = true;
            marginLength += 1;
            parents[nextMarginKey] = nextMarginParent;

            /* add next margin item to resul tree */
            if (!result.hasOwnProperty(nextMarginParent)) {
                result[nextMarginParent] = [];
            }
            result[nextMarginParent].push(nextMarginKey);
        }

        for(index = 0, len = itemsToRemove.length; index < len; index+=1) {
            /* delete visited node from margin */
            delete margin[itemsToRemove[index]];
            marginLength -= 1;
        }
    }

    return result;
};

primitives.famdiagram.Controller.prototype._attachFamilyToOrgChart = function (parent, siblingItem, family, isOnRight) {
    var levelIndex,
        familyRoot = family.items[0],
        newOrgItem = null,
        rootItem = parent;

    // fill in levels between parent and family root with invisible items
    for (levelIndex = parent.level + 1; levelIndex < familyRoot.level; levelIndex+=1) {
        this.maximumFamItemId+=1;
        newOrgItem = this._createOrgItem(this.maximumFamItemId, rootItem.id, null, levelIndex, null /* userItem */);
        newOrgItem.title = "shift";
        newOrgItem.isVisible = false;
        newOrgItem.hideParentConnection = true;
        newOrgItem.hideChildrenConnection = true;
        family.items.push(newOrgItem);

        rootItem = newOrgItem;
    }

    // attach family root 
    familyRoot.parent = rootItem.id;
    familyRoot.hideParentConnection = true;
    this._adoptOrgItem(familyRoot, siblingItem, isOnRight);
};

primitives.famdiagram.Controller.prototype._extractOrgChart = function (family, grandParent) {
    var index, len,
        children = [], tempChildren,
        childItem,
        rootItem = null,
        newOrgItem;

    /* extract root item */
    newOrgItem = this._createOrgItem(grandParent.id, rootItem, family.id, grandParent.level, grandParent.itemConfig);
    newOrgItem.hideParentConnection = true;
    newOrgItem.isVisible = grandParent.isVisible;
    family.items.push(newOrgItem);

    delete this._famItemsNonExtracted[grandParent.id];
    grandParent.familyId = family.id;

    /* extract its children */
    children = this._extractChildren(family, grandParent);

    while (children.length > 0) {
        tempChildren = [];
        for (index = 0, len = children.length; index < len; index+=1) {
            childItem = children[index];
            tempChildren = tempChildren.concat(this._extractChildren(family, childItem));
        }

        children = tempChildren;
    }
};

primitives.famdiagram.Controller.prototype._extractChildren = function (family, parentItem) {
    var result = [],
        index, len,
        id, childItem,
        spouseId, spouseItem,
        itemByChildrenKey = {},
        children,
        childrenKey,
        parentChildren = parentItem.logicalChildren.slice(0).sort(),
        parentChildrenKey = parentChildren.toString(),
        partnerItem = null,
        newParentItem, newOrgItem;


    if (this.itemByChildrenKey[parentChildrenKey] != null) {
        /* all children already extracted */
        partnerItem = this.itemByChildrenKey[parentChildrenKey];

        if (this._orgPartners[partnerItem.id] == null) {
            this._orgPartners[partnerItem.id] = [];
        }
        this._orgPartners[partnerItem.id].push(parentItem.id);

        for (index = 0, len = parentItem.logicalChildren.length; index < len; index += 1) {
            id = parentItem.logicalChildren[index];
            family.links.push(new primitives.famdiagram.FamLink(parentItem.id, id));
        }
    } else {
        if (parentChildrenKey != "") {
            this.itemByChildrenKey[parentChildrenKey] = parentItem;
        }
        for (index = 0, len = parentItem.logicalChildren.length; index < len; index+=1) {
            id = parentItem.logicalChildren[index];
            childItem = this._famItems[id];
            if (this._famItemsNonExtracted.hasOwnProperty(childItem.id)) {
                children = childItem.logicalChildren.slice(0).sort();
                childrenKey = children.toString();
                if (itemByChildrenKey[childrenKey] != null) {
                    /* child item has the same children as other child in parentItem children collection
                        in organizational chart they are displayed as partners sharing children*/
                    newOrgItem = this._createOrgItem(childItem.id, itemByChildrenKey[childrenKey].id, family.id, childItem.level, childItem.itemConfig);
                    newOrgItem.isVisible = childItem.isVisible;
                    newOrgItem.itemType = 6/*primitives.orgdiagram.ItemType.GeneralPartner*/;
                    family.items.push(newOrgItem);

                    delete this._famItemsNonExtracted[childItem.id];
                    childItem.familyId = family.id;
                } else {
                    if (childrenKey != "") {
                        itemByChildrenKey[childrenKey] = childItem;
                    }

                    newParentItem = parentItem;
                    newOrgItem = this._createOrgItem(childItem.id, parentItem.id, family.id, childItem.level, childItem.itemConfig);
                    newOrgItem.isVisible = childItem.isVisible;
                    family.items.push(newOrgItem);
                    result.push(childItem);
                    delete this._famItemsNonExtracted[childItem.id];
                    childItem.familyId = family.id;
                }
            } else {
                /* all children already extracted */
                family.links.push(new primitives.famdiagram.FamLink(parentItem.id, childItem.id));

                if (this._orgChildren[parentItem.id] == null) {
                    this._orgChildren[parentItem.id] = [];
                }
                this._orgChildren[parentItem.id].push(childItem.id);
            }
        }


        if (childItem != null) {
            for (index = 0, len = childItem.logicalParents.length; index < len; index += 1) {
                spouseId = childItem.logicalParents[index];
                spouseItem = this._famItems[spouseId];

                if (this._famItemsNonExtracted.hasOwnProperty(spouseItem.id)) {
                    if (this._compareArrays(spouseItem.logicalChildren, parentItem.logicalChildren)) {
                        if (this.options.groupByType == 0/*primitives.common.GroupByType.Parents*/ || spouseItem.logicalParents.length == 0) {
                            newOrgItem = this._createOrgItem(spouseItem.id, parentItem.id, family.id, spouseItem.level, spouseItem.itemConfig);
                            newOrgItem.itemType = 7/*primitives.orgdiagram.ItemType.LimitedPartner*/;
                            newOrgItem.isVisible = spouseItem.isVisible;
                            family.items.push(newOrgItem);

                            delete this._famItemsNonExtracted[spouseItem.id];
                            spouseItem.familyId = family.id;
                        }
                    }
                }
            }
        }
    }
    return result;
};

primitives.famdiagram.Controller.prototype._createOrgItem = function (id, parentId, familyId, level, userItem) {
    var orgItem = new primitives.orgdiagram.OrgItem(),
        index, len,
        property;

    // OrgItem id coinsides with ItemConfig id since we don't add any new org items to user's org chart definition
    orgItem.id = id;
    orgItem.parent = parentId;
    orgItem.context = userItem; /* Keep reference to user's ItemConfig in context */

    orgItem.familyId = familyId;
    orgItem.level = level;

    for (index = 0, len = this.properties.length; index < len; index+=1) {
        property = this.properties[index];

        orgItem[property] = (userItem != null && userItem[property] !== undefined) ? userItem[property] : this.defaultItemConfig[property];
    }

    this._adoptOrgItem(orgItem, null, true);

    return orgItem;
};

primitives.famdiagram.Controller.prototype._adoptOrgItem = function (orgItem, siblingItem, isOnRight) {
    var index, children;
    this._orgItems[orgItem.id] = orgItem;

    if (orgItem.parent != null) {
        if (this._orgItemChildren.hasOwnProperty(orgItem.parent)) {
            children = this._orgItemChildren[orgItem.parent];
            if (siblingItem != null) {
                index = primitives.common.indexOf(children, siblingItem);
                if (isOnRight) {
                   children.splice(index + 1, 0, orgItem);
                } else {
                   children.splice(index, 0, orgItem);
                }
            } else {
                children.push(orgItem);
            }
        } else {
            this._orgItemChildren[orgItem.parent] = [orgItem];
        }
    }
};

primitives.famdiagram.Controller.prototype._compareArrays = function (array1, array2) {
    var result = true,
        index, len;
    if (array1.length != array2.length) {
        result = false;
    } else {
        array1.sort();
        array2.sort();
        for (index = 0, len = array1.length; index < len; index+=1) {
            if (array1[index] != array2[index]) {
                result = false;
                break;
            }
        }
    }
    return result;
};

primitives.famdiagram.Controller.prototype._findLargestRoot = function () {
    var result = null,
        maximum,
        itemId, famItem,
        levels = {},
        levelItems,
        index, len, levelIndex, 
        index2, len2,
        famItems = {}, items, id,
        counter,
        parentid;
    for (itemId in this._famItemsNonExtracted) {
        if (this._famItemsNonExtracted.hasOwnProperty(itemId)) {
            famItem = this._famItemsNonExtracted[itemId];
            if (!levels.hasOwnProperty(famItem.level)) {
                levels[famItem.level] = [];

                this.minimumLevel = this.minimumLevel != null ? Math.min(this.minimumLevel, famItem.level) : famItem.level;
                this.maximumLevel = this.maximumLevel != null ? Math.max(this.maximumLevel, famItem.level) : famItem.level;
            }
            levels[famItem.level].push(famItem);
        }
    }
    for (levelIndex = this.maximumLevel; levelIndex >= this.minimumLevel; levelIndex-=1) {
        levelItems = levels[levelIndex];
        if (levelItems != null) {
            for (index = 0, len = levelItems.length; index < len; index+=1) {
                famItem = levelItems[index];
                if (!famItems.hasOwnProperty(famItem.id)) {
                    famItems[famItem.id] = {};
                }
                famItems[famItem.id][famItem.id] = true;
                for (index2 = 0, len2 = famItem.logicalParents.length; index2 < len2; index2+=1) {
                    parentid = famItem.logicalParents[index2];
                    if (this._famItemsNonExtracted.hasOwnProperty(parentid)) {
                        if (!famItems.hasOwnProperty(parentid)) {
                            famItems[parentid] = {};
                        }
                        famItems[parentid][famItem.id] = true;
                        if (famItems.hasOwnProperty(famItem.id)) {
                            items = famItems[famItem.id];
                            for (itemId in items) {
                                if (items.hasOwnProperty(itemId)) {
                                    famItems[parentid][itemId] = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    maximum = 0;
    for (itemId in famItems) {
        if (famItems.hasOwnProperty(itemId)) {
            items = famItems[itemId];
            counter = 0;
            for (id in items) {
                if (items.hasOwnProperty(id)) {
                    counter+=1;
                }
            }
            if (counter > maximum) {
                maximum = counter;
                result = itemId;
            }
        }
    }
    return result;
};

primitives.famdiagram.Controller.prototype._sortItemsBylevels = function (placedItem) {
    var index, len, parentItem, childItem,
        tempParentEdges,
        tempChildrenEdges,
        parentEdges = this._getParentEdges(placedItem),
        childrenEdges = this._getChildrenEdges(placedItem);

    /* we have to itterate all available edges in graph */
    while (parentEdges.length > 0 || childrenEdges.length > 0) {
        tempParentEdges = [];
        tempChildrenEdges = [];

        /* itterate children first */
        for (index = 0, len = childrenEdges.length; index < len; index+=1) {
            parentItem = this._famItems[childrenEdges[index].parent];
            childItem = this._famItems[childrenEdges[index].child];

            if (childItem.level == null) {
                /* Child item does not placed yet, so we have to 
                scan all placed parents in order to find maximum level*/
                childItem.level = this._getMaximumLevel(childItem.logicalParents) + 1;

                tempParentEdges = tempParentEdges.concat(this._getParentEdges(childItem));
                tempChildrenEdges = tempChildrenEdges.concat(this._getChildrenEdges(childItem));
            } else if (childItem.level <= parentItem.level) {
                /* child item placed and it needs to be shifted below placedItem*/
                this._shiftChartItem(childItem, parentItem.level - childItem.level + 1);
            }
        }
        /* itterate parents in second turn */
        for (index = 0, len = parentEdges.length; index < len; index+=1) {
            parentItem = this._famItems[parentEdges[index].parent];
            childItem = this._famItems[parentEdges[index].child];

            if (parentItem.level == null) {
                /* Parent item does not placed yet, so we have to 
                scan all its placed children in order to find minimum level*/
                parentItem.level = this._getMinimumLevel(parentItem.logicalChildren) - 1;

                tempParentEdges = tempParentEdges.concat(this._getParentEdges(parentItem));
                tempChildrenEdges = tempChildrenEdges.concat(this._getChildrenEdges(parentItem));
            } else if (childItem.level <= parentItem.level) {
                /* child item placed and it needs to be shifted below placedItem*/
                this._shiftChartItem(childItem, (parentItem.level - childItem.level + 1));
            }
        }

        parentEdges = tempParentEdges;
        childrenEdges = tempChildrenEdges;
    }
};

primitives.famdiagram.Controller.prototype._getParentEdges = function (placedItem) {
    var index, len, parentId,
        result = [];
    for (index = 0, len = placedItem.logicalParents.length; index < len; index+=1) {
        parentId = placedItem.logicalParents[index];
        result.push(new primitives.famdiagram.EdgeItem(parentId, placedItem.id));
    }
    return result;
};

primitives.famdiagram.Controller.prototype._getChildrenEdges = function (placedItem) {
    var index, len, childId,
        result = [];
    for (index = 0, len = placedItem.logicalChildren.length; index < len; index+=1) {
        childId = placedItem.logicalChildren[index];
        result.push(new primitives.famdiagram.EdgeItem(placedItem.id, childId));
    }
    return result;
};

var depth = 0;

primitives.famdiagram.Controller.prototype._shiftChartItem = function (shiftedItem, offset) {
    var index, len, chartItem;
    shiftedItem.level += offset;

    depth+=1;

    if (offset > 0) {
        for (index = 0, len = shiftedItem.logicalChildren.length; index < len; index+=1) {
            chartItem = this._famItems[shiftedItem.logicalChildren[index]];
            if (chartItem.level != null) {
                if (chartItem.level <= shiftedItem.level) {
                    this._shiftChartItem(chartItem, shiftedItem.level - chartItem.level + 1);
                }
            }
        }
    } else {
        for (index = 0, len = shiftedItem.logicalParents.length; index < len; index+=1) {
            chartItem = this._famItems[shiftedItem.logicalParents[index]];
            if (chartItem.level != null) {
                if (chartItem.level >= shiftedItem.level) {
                    this._shiftChartItem(chartItem, shiftedItem.level - chartItem.level - 1);
                }
            }
        }
    }

    depth-=1;
};

primitives.famdiagram.Controller.prototype._getMaximumLevel = function (items) {
    var index, len, result, chartItem;
    for (index = 0, len = items.length; index < len; index+=1) {
        chartItem = this._famItems[items[index]];
        if (chartItem.level != null) {
            result = result != null ? Math.max(result, chartItem.level) : chartItem.level;
        }
    }
    return result;
};

primitives.famdiagram.Controller.prototype._getMinimumLevel = function (items) {
    var index, len, result, chartItem;
    for (index = 0, len = items.length; index < len; index+=1) {
        chartItem = this._famItems[items[index]];
        if (chartItem.level != null) {
            result = result != null ? Math.min(result, chartItem.level) : chartItem.level;
        }
    }
    return result;
};
primitives.famdiagram.EdgeItem = function (arg0, arg1) {
    this.parent = null;
    this.child = null;

    switch (arguments.length) {
        case 2:
            this.parent = arg0;
            this.child = arg1;
            break;
        default:
            break;
    }
};
primitives.famdiagram.Family = function (id) {
    this.id = null;
    this.familyPriority = null;
	this.items = [];

	this.links = []; /* array of FamLink's */
	this.backLinks = []; /* array of FamLink's */

	if (arguments.length == 1) {
	    this.id = id;
	}
};
primitives.famdiagram.FamilyItem = function () {
    this.id = null;
    this.familyId = null;
    this.itemConfig = null;

    this.isVisible = true;

    this.logicalChildren = [];
    this.logicalParents = [];
    this.level = null;
};
primitives.famdiagram.FamLink = function (fromItem, toItem) {
    this.fromItem = fromItem; /* FamilyItem.id */
    this.toItem = toItem; /* FamilyItem.id */
};
/*
 * jQuery UI Diagram
 *
 * Basic Primitives family diagram.
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function ($) {
    $.widget("ui.famDiagram", jQuery.ui.mouse2, new primitives.famdiagram.Controller());
}(jQuery));
/*
    Class: primitives.orgdiagram.EventArgs
	    Event details class.
*/
primitives.orgdiagram.EventArgs = function () {
	/*
	Property: oldContext
	    Reference to associated previous item in hierarchy.
    */
	this.oldContext = null;

	/*
	Property: context
	    Reference to associated new item in hierarchy.
    */
	this.context = null;

	/*
    Property: parentItem
        Reference parent item of item in context.
    */
	this.parentItem = null;

	/*
	Property: position
	    Absolute item position on diagram.

	See also:
	    <primitives.common.Rect>
    */
	this.position = null;

	/*
    Property: name
        Relative object name.

    */
	this.name = null;

	/*
	Property: cancel
	    Allows cancelation of coupled event processing. This option allows to cancel layout update 
        and subsequent <primitives.orgdiagram.Config.onCursorChanged> event 
        in handler of <primitives.orgdiagram.Config.onCursorChanging> event.
    */
	this.cancel = false;
};
/*
    Class: primitives.orgdiagram.TemplateConfig
        User defines item template class. It may optionaly define template for item, 
		custom cursor and highlight. If template is null then default template is used.

    See Also:
		<primitives.orgdiagram.Config.templates>
*/
primitives.orgdiagram.TemplateConfig = function () {
	/*
	Property: name
		Every template should have unique name. It is used as reference when 
		custom template is defined in <primitives.orgdiagram.ItemConfig.templateName>.
    */
	this.name = null;

	/*
	Property: itemSize
	This is item size of type <primitives.common.Size>, templates should have 
	fixed size, so orgDiagram uses this value in order to layout items properly.
    */
	this.itemSize = new primitives.common.Size(120, 100);

	/*
    Property: itemBorderWidth
        Item template border width.
    */
	this.itemBorderWidth = 1;

	/*
	Property: itemTemplate
	Item template, if it is null then default item template is used. It supposed 
	to be div html element containing named elements inside for setting them 
	in <primitives.orgdiagram.Config.onItemRender> event.
    */
	this.itemTemplate = null;

	/*
	Property: minimizedItemSize
	This is size dot used to display item in minimized form, type of <primitives.common.Size>.
    */
	this.minimizedItemSize = new primitives.common.Size(4, 4);

	/*
	Property: highlightPadding
	This padding around item defines relative size of highlight object, 
	ts type is <primitives.common.Thickness>.
    */
	this.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);

	/*
    Property: highlightBorderWidth
        Highlight border width.
    */
	this.highlightBorderWidth = 1;

	/*
	Property: highlightTemplate
	Highlight template, if it is null then default highlight template is used. 
	It supposed to be div html element containing named elements inside for 
	setting them in <primitives.orgdiagram.Config.onHighlightRender> event.
    */
	this.highlightTemplate = null;

	/*
    Property: cursorPadding
    This padding around item defines relative size of cursor object, 
	its type is <primitives.common.Thickness>.
    */
	this.cursorPadding = new primitives.common.Thickness(3, 3, 3, 3);

	/*
    Property: cursorBorderWidth
        Cursor border width.
    */
	this.cursorBorderWidth = 2;

	/*
	Property: cursorTemplate
	Cursor template, if it is null then default cursor template is used. 
	It supposed to be div html element containing named elements inside 
	for setting them in <primitives.orgdiagram.Config.onCursorRender> event.
    */
	this.cursorTemplate = null;
};
/*
    Class: primitives.orgdiagram.ButtonConfig
	    Options class. Custom user button options class. 
        Buttons displayed on the right side of item. 
        See jQuery UI Button options description for details.
	    In order to receive button click event make binding 
        to <primitives.orgdiagram.Config.onButtonClick>.
    
    See Also:
	    <primitives.orgdiagram.Config.buttons>
*/
primitives.orgdiagram.ButtonConfig = function (name, icon, tooltip) {
    /*
	Property: name 
	    It should be unique string name of the button. 
        It is needed to distinguish click events from different butons.
    */
    this.name = name;

    /*
	Property: icon
	Name of icon used in jQuery UI.
    */
    this.icon = icon;
    /*
	Property: text
	Whether to show any text -when set to false (display no text), 
    icon must be enabled, otherwise it'll be ignored.
    */
    this.text = false;
    /*
	Property: label
	Text to show on the button.
    */
    this.label = null;
	/*
	Property: tooltip
	Button tooltip content.
	*/
    this.tooltip = tooltip;
    /*
	Property: size
	Size of the button of type <primitives.common.Size>.
    */
    this.size = new primitives.common.Size(16, 16);
};
/*
    Class: primitives.orgdiagram.Config
	    jQuery orgDiagram Widget options class. Organizational chart configuration object.
	
*/
primitives.orgdiagram.Config = function (name) {
	this.name = (name !== undefined) ? name : "OrgDiagram";
	this.classPrefix = "orgdiagram";

	/*
	    Property: graphicsType
			Preferable graphics type. If preferred graphics type 
            is not supported widget switches to first available. 

		Default:
			<primitives.common.GraphicsType.SVG>
    */
	this.graphicsType = 0/*primitives.common.GraphicsType.SVG*/;

	/*
	    Property: actualGraphicsType
			Actual graphics type.
    */
	this.actualGraphicsType = null;

	/*
	    Property: pageFitMode
            Defines the way diagram is fit into page. By default chart minimize items when it has not enough space to fit all of them into screen. 
            Chart has its maximum size when all items shown in full size and  its minimal size when all items shown as dots. 
            It is equivalent of full zoom out of the chart items, dot size items are not readable, but such presentation of them 
            gives possibility to overview chart layout. So chart tryes to combine both presenation modes and keep chart as small 
            as possible in order to give user possibility to see big picture. Collapsed items provide ideal way for analitical reiew of 
            organizational diagram. If chart shown in its maximum size when all items are unfolded, it becomes impossible 
            to navigate betwen parents close to the root item. In such mode chart is usable only at bottom levels when children are close to their parents.
            If we try to navigate up to the root of hierarchy, gaps between parents sometimes as big as screen size. So in order to solve these 
            issues chart partially collapses hierarchy into dots and lines depending on this option.

        See also:
            <primitives.orgdiagram.Config.minimalVisibility>

		Default:
			<primitives.common.PageFitMode.FitToPage>
    */
	this.pageFitMode = 3/*primitives.common.PageFitMode.FitToPage*/;

    /*
        Property: minimalVisibility
            Defines minimal allowed item form size for page fit mode. See description for pageFitMode.
    
        See also:
            <primitives.orgdiagram.Config.pageFitMode>

        Default:
            <primitives.common.Visibility.Dot>
    */
	this.minimalVisibility = 2/*primitives.common.Visibility.Dot*/;

	/*
		Property: orientationType
			Chart orientation. Chart can be rotated left, right and bottom.
            Rotation to the right side is equivalent to left side placement 
            in countries writing from right to left, so it is important for localization.

		Default:
			<primitives.common.OrientationType.Top>
    */
	this.orientationType = 0/*primitives.common.OrientationType.Top*/;

	/*
		Property: horizontalAlignment
            Defines items horizontal alignment relative to their parent. 
            This is usefull for control localization for right-to-left countries.
        
        Default:
            <primitives.common.HorizontalAlignmentType.Center>
    */
	this.horizontalAlignment = 0/*primitives.common.HorizontalAlignmentType.Center*/;

    /*
    Property: verticalAlignment
        Defines items vertical alignment relative to each other within one level of hierarchy. 
        It does not affect levels having same size items.
    
    Default:
        <primitives.common.VerticalAlignmentType.Middle>
*/
	this.verticalAlignment = 1/*primitives.common.VerticalAlignmentType.Middle*/;

	/*
        Property: connectorType
           Defines connector lines style for dot and line elements. If elements are in their normal full size 
           form they are connected with squired connection lines. So this option controls connector lines style for dots only.
           
        Default:
            <primitives.common.ConnectorType.Squared>
    */
	this.connectorType = 0/*primitives.common.ConnectorType.Squared*/;

	/*
	Property: emptyDiagramMessage
	    Empty message in order to avoid blank screen. This option is supposed to say user that chart is empty when no data inside.
    */
	this.emptyDiagramMessage = "Diagram is empty.";

    /*
    Property: items
        This is chart items collection. It is regular array of items of type ItemConfig. Items reference each other via parent property. 
        So every item may have only one parent in chart. If parent set to null then item displayed at root of chart. 
        Chart can have multiple root items simultaniously. If item references missing item, then it is ignored. 
        If items loop each other they are ignored as well. It is applications responsiblity to avoid such issues.

	See Also:
        <primitives.orgdiagram.ItemConfig>
	    <primitives.orgdiagram.ItemConfig.id>
        <primitives.orgdiagram.ItemConfig.parent>
    */
	this.items = [];

    /*
    Property: annotations
        Defines array of annotaions objects. Chart supports several types of annotations. They are drawn on top of chart and they may block view of some of them.
        So chart's layout mechanism does not account available annotations. Don't over use this feature. 
        The design assumes only few of them being displayed simultanuosly. This is especially true for connectors.

    See also:
        <primitives.orgdiagram.ConnectorAnnotationConfig>
        <primitives.orgdiagram.ShapeAnnotationConfig>
    */
	this.annotations = [];

    /*
    Property: cursorItem
        Cursor item id - it is single item selection mode, user selects new cursor item on mouse click. 
        Cursor defines current local zoom placement or in other words current navigation item in the chart,
        all items relative to cursor always shoun in full size. So user can see all possible items around cursor in full size 
        and can continue navigation around chart. So when user navigates from one item to another clicking on thems and changing cursor item
        in chart, chart minimizes items going out of cursor scope and shows in full size items relative to new cursor position.
        If it is null then no cursor shown on diagram.

	See Also:
	    <primitives.orgdiagram.ItemConfig.id>
        <primitives.orgdiagram.Config.onCursorChanging>
        <primitives.orgdiagram.Config.onCursorChanged>
    */
	this.cursorItem = null;

	/*
	Property: highlightItem
	    Highlighted item id. Highlight is mouse over affect, but using this option applicatin can set highlight at any item 
        in the chart programmatically. It can be used for chart syncronization with other controls on UI having mouse over effect. 
        See primitives.orgdiagram.Config.update method arguments description for fast chart update.
        If it is null then no highlight shown on diagram.

	See Also:
	    <primitives.orgdiagram.ItemConfig.id>
        <primitives.orgdiagram.Config.onHighlightChanging>
        <primitives.orgdiagram.Config.onHighlightChanged>
    */
	this.highligtItem = null;


	/*
	Property: selectedItems
	    Defines array of selected item ids. Chart allows to select items via checking checkboxes under items. Checkboxes are 
        shown only for full size items. So when item is selected it is always shown in full size, so check box always visible for selcted items.
        User can navigate around large diagram and check intrested items in order to keep them opened. So that way chart provides 
        means to show several items on large diagram and fit everything into minimal space ideally into available screen space.
        Application can select items programmatically using this array or receive notifications from chart about user selections with following events.

	See Also:
	    <primitives.orgdiagram.ItemConfig.id>
        <primitives.orgdiagram.Config.onSelectionChanging>
        <primitives.orgdiagram.Config.onSelectionChanged>
    */
	this.selectedItems = [];

	/*
    Property: hasSelectorCheckbox
        This option controls selection check boxes visibility. 

    Auto - Checkbox shown only for current cursor item only.
    True - Every full size item has selection check box.
    False - No check boxes. Application can still programmatically select some items in the chart. 
    Application may provide custom item template having checkbox inside of item. If application defined check box inside of item template has name="checkbox"
    it is auto used as default selection check box.

    Default:
        <primitives.common.Enabled.Auto>

	See Also:
        <primitives.orgdiagram.ItemConfig.hasSelectorCheckbox>
        <primitives.orgdiagram.Config.onSelectionChanging>
        <primitives.orgdiagram.Config.onSelectionChanged>
    */
	this.hasSelectorCheckbox = 0/*primitives.common.Enabled.Auto*/;

    /*
        Property: selectCheckBoxLabel
            Select check box label.
    */
	this.selectCheckBoxLabel = "Selected";

	/*
	Property: selectionPathMode
	    Defines the way items between root item and selectedItems displayed in diagram. Chart always shows all items between cursor item and its root in full size.
        But if cursor positioned on root item, then chart shows in full size only selected items in the chart. So this option controls items size between 
        selected items and root item of the chart. By default all items betwen root and selected items shown in full size.
	    
	Default:
	    <primitives.common.SelectionPathMode.FullStack>
    */
	this.selectionPathMode = 1/*primitives.common.SelectionPathMode.FullStack*/;

	/*
	Property: templates
	    Custom user templates collection. TemplateConfig is complex object providing options to customize item's content template, 
        cursor tempate and highlight template. Every template config should have unique name property, which is used by chart and its item configs 
        to reference them. Chart's defaultTemplateName allows to make template default for all items in the chart. On other hand user may define templates
        to individual items in the chart by templateName property of item config.

	See also:
	    <primitives.orgdiagram.TemplateConfig>
		<primitives.orgdiagram.Config.defaultTemplateName>
		<primitives.orgdiagram.ItemConfig.templateName>
    */
	this.templates = [];

	/*
	    Property: defaultTemplateName
		    This is template name used to render items having no <primitives.orgdiagram.ItemConfig.templateName> defined.


		See Also:
			<primitives.orgdiagram.TemplateConfig>
			<primitives.orgdiagram.TemplateConfig.name>
			<primitives.orgdiagram.Config.templates>
	*/
	this.defaultTemplateName = null;

	/*
    Property: hasButtons
        This option controls user buttons visibility. 

    Auto - Buttons visible only for cursor item.
    True - Every normal item has buttons visible.
    False - No buttons.

    Default:
		<primitives.common.Enabled.Auto>
    */
	this.hasButtons = 0/*primitives.common.Enabled.Auto*/;

	/*
	Property: buttons
	    Custom user buttons displayed on right side of item. This collection provides simple way to define context buttons for every item. 
        The only limitation, they are all the same. So if you need to have unique buttons for every item, then you have to 
        customize cursor templates and manually create custom buttons inside of them.
	    
	See also:
	    <primitives.orgdiagram.ButtonConfig>
    */
	this.buttons = [];

	/*
    Event: onHighlightChanging
        Notifies about changing highlight item <primitives.orgdiagram.Config.highlightItem> in diagram.
        This coupled event with <primitives.orgdiagram.Config.onHighlightChanged>, it is fired before highlight update.

    See also:
        <primitives.orgdiagram.EventArgs>
    */
	this.onHighlightChanging = null;

	/*
	Event: onHighlightChanged
	    Notifies about changed highlight item <primitives.orgdiagram.Config.highlightItem> in diagram.

    See also:
        <primitives.orgdiagram.EventArgs>
    */
	this.onHighlightChanged = null;

	/*
    Event: onCursorChanging
        Notifies about changing cursor item <primitives.orgdiagram.Config.cursorItem> in diagram.
        This coupled event with <primitives.orgdiagram.Config.onCursorChanged>, it is fired before layout update.

    See also:
        <primitives.orgdiagram.EventArgs>
    */
	this.onCursorChanging = null;

	/*
	Event: onCursorChanged
	    Notifies about changed cursor item <primitives.orgdiagram.Config.cursorItem> in diagram .

    See also:
        <primitives.orgdiagram.EventArgs>
    */
	this.onCursorChanged = null;

	/*
	Event: onSelectionChanging
	    Notifies about changing selected items collection of <primitives.orgdiagram.Config.selectedItems>.

    See also:
        <primitives.orgdiagram.EventArgs>
    */
	this.onSelectionChanging = null;

	/*
	Event: onSelectionChanged
	    Notifies about changes in collection of <primitives.orgdiagram.Config.selectedItems>.

    See also:
        <primitives.orgdiagram.EventArgs>
    */
	this.onSelectionChanged = null;

	/*
	Event: onButtonClick
	    Notifies about click of custom user button defined in colelction of <primitives.orgdiagram.Config.buttons>.

    See also:
        <primitives.orgdiagram.EventArgs>
    */
	this.onButtonClick = null;

	/*
	Event: onMouseClick
	    On mouse click event. 

    See also:
        <primitives.orgdiagram.EventArgs>
    */
	this.onMouseClick = null;

	/*
	Event: onItemRender
	    Item templates don't provide means to bind data of items into templates. So this event handler gives application such possibility.
        If application uses custom templates then this method is called to populate template with items properties.

    See also:
        <primitives.common.RenderEventArgs>
        <primitives.orgdiagram.TemplateConfig>
        <primitives.orgdiagram.Config.templates>
    */
	this.onItemRender = null;

	/*
	Event: onHighlightRender
	    If user defined custom highlight template for item template 
		then this method is called to populate it with context data.

    See also:
        <primitives.common.RenderEventArgs>
        <primitives.orgdiagram.TemplateConfig>
        <primitives.orgdiagram.Config.templates>
    */
	this.onHighlightRender = null;
	/*
	Event: onCursorRender
	    If user defined custom cursor template for item template 
		then this method is called to populate it with context data.

    See also:
        <primitives.common.RenderEventArgs>
        <primitives.orgdiagram.TemplateConfig>
        <primitives.orgdiagram.Config.templates>
    */
	this.onCursorRender = null;
	/*
	Property: normalLevelShift
	    Defines interval after level of items in  diagram having items in normal state.
    */
	this.normalLevelShift = 20;
	/*
	Property: dotLevelShift
	    Defines interval after level of items in  diagram having all items in dot state.
    */
	this.dotLevelShift = 20;
	/*
	Property: lineLevelShift
	    Defines interval after level of items in  diagram having items in line state.
    */
	this.lineLevelShift = 10;

	/*
	Property: normalItemsInterval
	    Defines interval between items at the same level in  diagram having items in normal state.
    */
	this.normalItemsInterval = 10;
	/*
	Property: dotItemsInterval
	    Defines interval between items at the same level in  diagram having items in dot state.
    */
	this.dotItemsInterval = 1;
	/*
	Property: lineItemsInterval
	    Defines interval between items at the same level in  diagram having items in line state.
    */
	this.lineItemsInterval = 2;

	/*
	Property: cousinsIntervalMultiplier
        Use this interval multiplier between cousins in hiearchy. The idea of this option to make extra space between cousins. 
        So children belonging to different parents have extra gap between them.
		
	*/
	this.cousinsIntervalMultiplier = 5;

	/*
	method: update
	    Makes full redraw of diagram contents reevaluating all options.
	
	Parameters:
	    updateMode: This parameter defines severaty of update <primitives.common.UpdateMode>. 
	    For example <primitives.common.UpdateMode.Refresh> updates only 
		items and selection reusing existing elements where ever it is possible.

    See also:
        <primitives.common.UpdateMode>

    Default:
        <primitives.common.UpdateMode.Recreate>
    */

	/*
    Property: itemTitleFirstFontColor
    This property customizes default template title font color. 
	Item background color sometimes play a role of logical value and 
	can vary over a wide range, so as a result title having 
	default font color may become unreadable. Widgets selects the best font color 
	between this option and <primitives.orgdiagram.Config.itemTitleSecondFontColor>.

    See Also:
		<primitives.orgdiagram.ItemConfig.itemTitleColor>
		<primitives.orgdiagram.Config.itemTitleSecondFontColor>
		<primitives.common.highestContrast>

    */
	this.itemTitleFirstFontColor = "#ffffff"/*primitives.common.Colors.White*/;

	/*
	Property: itemTitleSecondFontColor
	Default template title second font color.
    */
	this.itemTitleSecondFontColor = "#000080"/*primitives.common.Colors.Navy*/;

	/*
    Property: linesColor
        Connectors lines color. Connectors are basic connections betwen chart items 
        defining their logical relationships, don't mix with connector annotations. 
    */
	this.linesColor = "#c0c0c0"/*primitives.common.Colors.Silver*/;

	/*
    Property: linesWidth
        Connectors lines width.
    */
	this.linesWidth = 1;

    /*
    Property: linesType
        Connectors line pattern.

    Default:
        <primitives.common.LineType.Solid>
    */
	this.linesType = 0/*primitives.common.LineType.Solid*/;

    /*
    Property: highlightLinesColor
        Connectors highlight line color. Connectors are basic connections betwen chart items 
        defining their logical relationships, don't mix with connector annotations. 
    */
	this.highlightLinesColor = "#ff0000"/*primitives.common.Colors.Red*/;

    /*
    Property: highlightLinesWidth
        Connectors highlight line width.
    */
	this.highlightLinesWidth = 1;

    /*
    Property: highlightLinesType
        Connectors highlight line pattern.

    Default:
        <primitives.common.LineType.Solid>
    */
	this.highlightLinesType = 0/*primitives.common.LineType.Solid*/;

	/*
	Property: showCallout
		This option controls callout visibility for dotted items. 

	Default:
	    true
	*/
	this.showCallout = true;

	/*
	Property: defaultCalloutTemplateName
		This is template name used to render callouts for dotted items. 
		Actual callout template name is defined by following sequence:
		<primitives.orgdiagram.ItemConfig.calloutTemplateName> 
		<primitives.orgdiagram.ItemConfig.templateName>
		<primitives.orgdiagram.Config.defaultCalloutTemplateName>
		<primitives.orgdiagram.Config.defaultTemplateName>


	See Also:
		<primitives.orgdiagram.Config.templates> collection property.

	Default:
	    null
	*/
	this.defaultCalloutTemplateName = null;

	/*
    Property: calloutfillColor
        Annotation callout fill color.
    */
	this.calloutfillColor = "#000000";

	/*
    Property: calloutBorderColor
        Annotation callout border color.
    */
	this.calloutBorderColor = null;

	/*
    Property: calloutOffset
        Annotation callout offset.
    */
	this.calloutOffset = 4;

	/*
    Property: calloutCornerRadius
        Annotation callout corner radius.
    */
	this.calloutCornerRadius = 4;

	/*
    Property: calloutPointerWidth
        Annotation callout pointer base width.
    */
	this.calloutPointerWidth = "10%";

	/*
    Property: calloutLineWidth
        Annotation callout border line width.
    */
	this.calloutLineWidth = 1;

	/*
    Property: calloutOpacity
        Annotation callout opacity.
    */
	this.calloutOpacity = 0.2;

	/*
	Property: childrenPlacementType
		Defines children placement form.
	*/
	this.childrenPlacementType = 2/*primitives.common.ChildrenPlacementType.Horizontal*/;

	/*
    Property: leavesPlacementType
        Defines leaves placement form. Leaves are children having no sub children.
    */
	this.leavesPlacementType = 2/*primitives.common.ChildrenPlacementType.Horizontal*/;

	/*
    Property: maximumColumnsInMatrix
        Maximum number of columns for matrix leaves layout. Leaves are children having no sub children.
	*/
	this.maximumColumnsInMatrix = 6;

	/*
    Property: buttonsPanelSize
        User buttons panel size.
    */
	this.buttonsPanelSize = 28;

	/*
    Property: groupTitlePanelSize
        Group title panel size.
    */
	this.groupTitlePanelSize = 24;

	/*
    Property: checkBoxPanelSize
        Selection check box panel size.
    */
	this.checkBoxPanelSize = 24;

	this.distance = 3;

	/*
	Property: minimumScale
		Minimum CSS3 scale transform. Available on mobile safary only.
	*/
	this.minimumScale = 0.5;

	/*
	Property: maximumScale
		Maximum CSS3 scale transform. Available on mobile safary only.
	*/
	this.maximumScale = 1;

	/*
	Property: showLabels
		This option controls items labels visibility. Labels are displayed in form of divs having text inside, long strings are wrapped inside of them. 
		User can control labels position relative to its item. Chart does not preserve space for labels, 
		so if they overlap each other then horizontal or vertical intervals between rows and items shoud be manually increased.
    
	Auto - depends on available space.
    True - always shown.
    False - hidden.

    See Also:
		<primitives.orgdiagram.ItemConfig.label>
		<primitives.orgdiagram.Config.labelSize>
		<primitives.orgdiagram.Config.normalItemsInterval>
		<primitives.orgdiagram.Config.dotItemsInterval>
		<primitives.orgdiagram.Config.lineItemsInterval>
		<primitives.orgdiagram.Config.normalLevelShift>
		<primitives.orgdiagram.Config.dotLevelShift>
		<primitives.orgdiagram.Config.lineLevelShift>

	Default:
	    <primitives.common.Enabled.Auto>
	*/
	this.showLabels = 0/*primitives.common.Enabled.Auto*/;

	/*
	Property: labelSize
		Defines label size. It is needed to avoid labels overlapping. If one label overlaps another label or item it will be hidden. 
		Label string is wrapped when its length exceeds available width.

	Default:
		new <primitives.common.Size>(80, 24);
	*/
	this.labelSize = new primitives.common.Size(80, 24);

	/*
	Property: labelOffset
		Defines label offset from dot in pixels.

	Default:
		1;
	*/
	this.labelOffset = 1;

	/*
	Property: labelOrientation
		Defines label orientation. 

    See Also:
    <primitives.text.TextOrientationType>

	Default:
		<primitives.text.TextOrientationType.Horizontal>
	*/
	this.labelOrientation = 0/*primitives.text.TextOrientationType.Horizontal*/;

	/*
	Property: labelPlacement
		Defines label placement relative to its dot. 
		Label is aligned to opposite side of its box.

	See Also:
	<primitives.common.PlacementType>

	Default:
		<primitives.common.PlacementType.Top>
	*/
	this.labelPlacement = 1/*primitives.common.PlacementType.Top*/;

	/*
	Property: labelFontSize
		Label font size. 

	Default:
		10px
*/
	this.labelFontSize = "10px";

	/*
	    Property: labelFontFamily
			Label font family. 

		Default:
			"Arial"
    */
	this.labelFontFamily = "Arial";

	/*
	    Property: labelColor
			Label color. 

		Default:
			primitives.common.Colors.Black
    */
	this.labelColor = "#000000"/*primitives.common.Colors.Black*/;

	/*
	    Property: labelFontWeight
			Font weight: normal | bold

		Default:
			"normal"
    */
	this.labelFontWeight = "normal";

	/*
    Property: labelFontStyle
        Font style: normal | italic
        
    Default:
        "normal"
    */
	this.labelFontStyle = "normal";

	/*
	Property: enablePanning
		Enable chart panning with mouse drag & drop for desktop browsers.

	Default:
		true
	*/
	this.enablePanning = true;
};
/*
    Class: primitives.orgdiagram.ConnectorAnnotationConfig
	    Options class. Populate annotation collection with instances of this objects to draw connector between two items.
    
    See Also:
	    <primitives.orgdiagram.Config.annotations>
*/
primitives.orgdiagram.ConnectorAnnotationConfig = function (arg0, arg1) {
    var property;

    /*
    Property: annotationType
        Connector shape type. Set this property to its default value if you create connector annotation without this prototype object.

    Default:
        <primitives.common.AnnotationType.Connector>
    */
    this.annotationType = 0/*primitives.common.AnnotationType.Connector*/;

    /*
    Property: zOrderType
        Defines connector Z order placement relative to chart items.

    Default:
        <primitives.common.ZOrderType.Foreground>
    */
    this.zOrderType = 2/*primitives.common.ZOrderType.Foreground*/;

    /*
	Property: fromItem 
	    Reference to from item in hierarchy.
	See Also:
	    <primitives.orgdiagram.ItemConfig.id>
    */
    this.fromItem = null;

    /*
    Property: toItem 
        Reference to from item in hierarchy.
	See Also:
	    <primitives.orgdiagram.ItemConfig.id>
    */
    this.toItem = null;

    /*
    Property: connectorShapeType
        Connector shape type. 

    Default:
        <primitives.common.ConnectorShapeType.OneWay>
    */
    this.connectorShapeType = 0/*primitives.common.ConnectorShapeType.OneWay*/;

    /*
    Property: offset
        Connector's from and to points offset off the rectangles side. Connectors connection points can be outside of rectangles and inside for negative offset value.
    See also:
        <primitives.common.Thickness>
    */
    this.offset = new primitives.common.Thickness(0, 0, 0, 0);

    /*
    Property: lineWidth
        Border line width. 
    */
    this.lineWidth = 2;

    /*
    Property: color
        Connector's color.
    
    Default:
        <primitives.common.Colors.Black>
    */
    this.color = "#000000"/*primitives.common.Colors.Black*/;

    /*
    Property: lineType
        Connector's line pattern.

    Default:
        <primitives.common.LineType.Solid>
    */
    this.lineType = 0/*primitives.common.LineType.Solid*/;

    /*
    Property: selectItems
        Make items shown always shown in normal state.
    */
    this.selectItems = true;

    /*
    Property: label
        Annotation label text. Label styled with css class name "bp-connector-label".
    */
    this.label = null;

    /*
	Property: labelSize
		Annotation label size.

	Default:
		new <primitives.common.Size>(60, 30);
	*/
    this.labelSize = new primitives.common.Size(60, 30);

    switch (arguments.length) {
        case 1:
            for (property in arg0) {
                if (arg0.hasOwnProperty(property)) {
                    this[property] = arg0[property];
                }
            }
            break;
        case 2:
            this.fromItem = arg0;
            this.toItem = arg1;
            break;
    }
};
/*
    Class: primitives.orgdiagram.PathAnnotationConfig
	    Options class. Populate annotation collection with instances of this objects to draw path between items.
        Path is drawn along base connection lines displaying relationships between item of the chart.
    See Also:
	    <primitives.orgdiagram.Config.annotations>
*/
primitives.orgdiagram.HighlightPathAnnotationConfig = function (arg0) {
    var property;

    /*
    Property: annotationType
        Connector shape type. Set this property to its default value if you create shape annotation without this prototype object.

    Default:
        <primitives.common.AnnotationType.Connector>
    */
    this.annotationType = 2/*primitives.common.AnnotationType.HighlightPath*/;

    /*
	Property: items 
	    Array of item ids in hierarchy.
	See Also:
	    <primitives.orgdiagram.ItemConfig.id>
    */
    this.items = [];


    /*
    Property: selectItems
        Make items shown always shown in normal state.
    */
    this.selectItems = false;

    switch (arguments.length) {
        case 1:
            if (arg0 !== null) {
                if (arg0 instanceof Array) {
                    this.items = arg0;
                } else if (typeof arg0 == "object") {
                    for (property in arg0) {
                        if (arg0.hasOwnProperty(property)) {
                            this[property] = arg0[property];
                        }
                    }
                }
            }
            break;
    }
};
/*
    Class: primitives.orgdiagram.ItemConfig
		Defines item in diagram hierarchy. 
		User is supposed to create hierarchy of this items and assign it to <primitives.orgdiagram.Config.items> collection property.
		Widget contains some generic properties used in default item template, 
		but user can add as many custom properties to this class as needed. 
		Just be careful and avoid widget malfunction.

    See Also:
		<primitives.orgdiagram.Config.items>
*/
primitives.orgdiagram.ItemConfig = function (arg0, arg1, arg2, arg3, arg4) {
    var property;
    /*
	Property: id
	Unique item id.
    */
    this.id = null;

    /*
    Property: parent
    Parent id. If parent is null then item placed as a root item.
    */
    this.parent = null;

	/*
	Property: title
	Default template title property.
    */
	this.title = null;

	/*
	Property: description
	Default template description element.
    */
	this.description = null;

	/*
	Property: image
	Url to image. This property is used in default template.
    */
	this.image = null;

    /*
    Property: context
    User context object.
    */
	this.context = null;

	/*
	Property: itemTitleColor
	Default template title background color.
    */
	this.itemTitleColor = "#4169e1"/*primitives.common.Colors.RoyalBlue*/;

	/*
    Property: groupTitle
    Auxiliary group title property. Displayed vertically on the side of item.
    */
	this.groupTitle = null;

	/*
    Property: groupTitleColor
    Group title background color.
    */
	this.groupTitleColor = "#4169e1"/*primitives.common.Colors.RoyalBlue*/;

	/*
    Property: isVisible
        If it is true then item is shown and selectable in hierarchy. 
		If item is hidden and it has visible children then only connector line is drawn instead of it.

    True - Item is shown.
    False - Item is hidden.

    Default:
		true
    */
	this.isVisible = true;

	/*
    Property: hasSelectorCheckbox
        If it is true then selection check box is shown for the item. 
		Selected items are always shown in normal form, so if item is 
		selected then its selection check box is visible and checked.

    Auto - Depends on <primitives.orgdiagram.Config.hasSelectorCheckbox> setting.
    True - Selection check box is visible.
    False - No selection check box.

    Default:
    <primitives.common.Enabled.Auto>
    */
	this.hasSelectorCheckbox = 0/*primitives.common.Enabled.Auto*/;

	/*
    Property: hasButtons
        This option controls buttons panel visibility. 

    Auto - Depends on <primitives.orgdiagram.Config.hasButtons> setting.
    True - Has buttons panel.
    False - No buttons panel.

    Default:
    <primitives.common.Enabled.Auto>
    */
	this.hasButtons = 0/*primitives.common.Enabled.Auto*/;

	/*
		Property: itemType
			This property defines how item should be shown. 
			So far it is only possible to make it invisible.
	
		See Also:
			<primitives.orgdiagram.ItemType>
		
		Deafult:
			<primitives.orgdiagram.ItemType.Regular>
    */
	this.itemType = 0/*primitives.orgdiagram.ItemType.Regular*/;

	/*
		Property: adviserPlacementType
			In case of item types <primitives.orgdiagram.ItemType.Assistant> 
			and <primitives.orgdiagram.ItemType.Adviser> this option defines item 
			placement side relative to parent. By default items placed on 
			the right side of parent item.

		Deafult:
			<primitives.common.AdviserPlacementType.Auto>
    */
	this.adviserPlacementType = 0/*primitives.common.AdviserPlacementType.Auto*/;

	/*
	Property: childrenPlacementType
		Defines children placement form.
	*/
	this.childrenPlacementType = 0/*primitives.common.ChildrenPlacementType.Auto*/;

	/*
	Property: templateName
		This is template name used to render this item.

		See Also:
		<primitives.orgdiagram.TemplateConfig>
		<primitives.orgdiagram.Config.templates> collection property.
    */
	this.templateName = null;

	/*
	Property: showCallout
		This option controls items callout visibility.

	Auto - depends on <primitives.orgdiagram.Config.showCallout> option
	True - shown
	False - hidden

	Default:
		<primitives.common.Enabled.Auto>
	*/
	this.showCallout = 0/*primitives.common.Enabled.Auto*/;

	/*
	Property: calloutTemplateName
		This is template name used to render callout for dotted item. 
		Actual callout template name is defined by following sequence:
		<primitives.orgdiagram.ItemConfig.calloutTemplateName> 
		<primitives.orgdiagram.ItemConfig.templateName>
		<primitives.orgdiagram.Config.defaultCalloutTemplateName>
		<primitives.orgdiagram.Config.defaultTemplateName>

	See Also:
		<primitives.orgdiagram.Config.templates> collection property.
	Default:
		null
	*/
	this.calloutTemplateName = null;

	/*
	Property: label
	Items label text.
	*/
	this.label = null;

	/*
	Property: showLabel
		This option controls items label visibility. Label is displayed in form of div having text inside, long string is wrapped inside of it. 
		User can control labels position relative to its item. Chart does not preserve space for label.

	Auto - depends on <primitives.orgdiagram.Config.labelOrientation> setting.
	True - always shown.
	False - hidden.

	See Also:
	<primitives.orgdiagram.ItemConfig.label>
	<primitives.orgdiagram.Config.labelSize>

	Default:
		<primitives.common.Enabled.Auto>
	*/
	this.showLabel = 0/*primitives.common.Enabled.Auto*/;

	/*
	Property: labelSize
		Defines label size. It is needed to avoid labels overlapping. If one label overlaps another label or item it will be hidden. 
		Label string is wrapped when its length exceeds available width. 
		By default it is equal to charts <primitives.orgdiagram.Config.labelSize>.

	See Also:
		<primitives.common.Size>
	Default:
		null;
	*/
	this.labelSize = null;

	/*
	Property: labelOrientation
		Defines label orientation. 
		In default <primitives.text.TextOrientationType.Auto> mode it depends on chart <primitives.orgdiagram.Config.labelOrientation> setting.

    See Also:
	<primitives.orgdiagram.Config.labelOrientation>
    <primitives.text.TextOrientationType>

	Default:
		<primitives.text.TextOrientationType.Auto>
	*/
	this.labelOrientation = 3/*primitives.text.TextOrientationType.Auto*/;

	/*
	Property: labelPlacement
		Defines label placement relative to the item. 
		In default <primitives.common.PlacementType.Auto> mode it depends on chart <primitives.orgdiagram.Config.labelPlacement> setting.

	See Also:
		<primitives.orgdiagram.Config.labelPlacement>
		<primitives.common.PlacementType>

	Default:
		<primitives.common.PlacementType.Auto>
	*/
	this.labelPlacement = 0/*primitives.common.PlacementType.Auto*/;

	switch (arguments.length) {
	    case 1:
	        for (property in arg0) {
	            if (arg0.hasOwnProperty(property)) {
	                this[property] = arg0[property];
	            }
	        }
	        break;
	    case 5:
	        this.id = arg0;
	        this.parent = arg1;
			this.title = arg2;
			this.description = arg3;
			this.image = arg4;
			break;
	}
};
/*
    Class: primitives.orgdiagram.ShapeAnnotationConfig
	    Options class. Populate annotation collection with instances of this objects to draw shape benith or on top of several items.
        Shape is drawn as rectangular area.
    See Also:
	    <primitives.orgdiagram.Config.annotations>
*/
primitives.orgdiagram.ShapeAnnotationConfig = function (arg0) {
    var property;

    /*
    Property: annotationType
        Connector shape type. Set this property to its default value if you create shape annotation without this prototype object.

    Default:
        <primitives.common.AnnotationType.Connector>
    */
    this.annotationType = 1/*primitives.common.AnnotationType.Shape*/;

    /*
    Property: zOrderType
        Defines shape Z order placement relative to chart items. Chart select the best order depending on shape type.

    Default:
        <primitives.common.ZOrderType.Auto>
    */
    this.zOrderType = 0/*primitives.common.ZOrderType.Auto*/;

    /*
	Property: items 
	    Array of items ids in hierarchy.
	See Also:
	    <primitives.orgdiagram.ItemConfig.id>
    */
    this.items = [];

    /*
    Property: shapeType
        Shape type. 

    Default:
        <primitives.common.ShapeType.Rectangle>
    */
    this.shapeType = 0/*primitives.common.ShapeType.Rectangle*/;

    /*
    Property: offset
        Connector's from and to points offset off the rectangles side. Connectors connection points can be outside of rectangles and inside for negative offset value.
    See also:
        <primitives.common.Thickness>
    */
    this.offset = new primitives.common.Thickness(0, 0, 0, 0);

    /*
    Property: lineWidth
        Border line width. 
    */
    this.lineWidth = 2;

    /*
    Property: cornerRadius
        Body corner radius in percents or pixels. For applicable shapes only.
    */
    this.cornerRadius = "10%";

    /*
    Property: opacity
        Background color opacity. For applicable shapes only.
    */
    this.opacity = 1;

    /*
    Property: borderColor
        Shape border line color.
    
    Default:
        null
    */
    this.borderColor = null;

    /*
    Property: fillColor
        Fill Color. 

    Default:
        null
    */
    this.fillColor = null;

    /*
    Property: lineType
        Connector's line pattern.

    Default:
        <primitives.common.LineType.Solid>
    */
    this.lineType = 0/*primitives.common.LineType.Solid*/;

    /*
    Property: selectItems
        Make items shown always shown in normal state.
    */
    this.selectItems = false;

    /*
    Property: label
        Annotation label text. Label styled with css class name "bp-connector-label".
    */
    this.label = null;

    /*
	Property: labelSize
		Annotation label size.

	Default:
		new <primitives.common.Size>(60, 30);
	*/
    this.labelSize = new primitives.common.Size(60, 30);

    /*
    Property: labelPlacement
        Defines label placement relative to the shape. 

    See Also:
        <primitives.orgdiagram.Config.labelPlacement>
        <primitives.common.PlacementType>

    Default:
        <primitives.common.PlacementType.Auto>
    */
    this.labelPlacement = 0/*primitives.common.PlacementType.Auto*/;

    /*
    Property: labelOffset
        Defines label offset from shape in pixels.

    Default:
        4;
    */
    this.labelOffset = 4;

    switch (arguments.length) {
        case 1:
            if (arg0 !== null) {
                if (arg0 instanceof Array) {
                    this.items = arg0;
                } else if (typeof arg0 == "object") {
                    for (property in arg0) {
                        if (arg0.hasOwnProperty(property)) {
                            this[property] = arg0[property];
                        }
                    }
                }
            }
            break;
    }
};
primitives.orgdiagram.Controller = function () {
	this.widgetEventPrefix = "orgdiagram";

	this.options = new primitives.orgdiagram.Config();

	this.options.linesPalette = [];
	this.groupByType = 0/*primitives.common.GroupByType.Parents*/;
};

primitives.orgdiagram.Controller.prototype = new primitives.orgdiagram.BaseController();

primitives.orgdiagram.Controller.prototype._getEventArgs = function (oldTreeItem, newTreeItem, name) {
    var result = new primitives.orgdiagram.EventArgs(),
        offset;

    if (oldTreeItem != null && oldTreeItem.itemConfig.id != null) {
        result.oldContext = this._treeItemConfigs[oldTreeItem.itemConfig.id];
    }

    if (newTreeItem != null && newTreeItem.itemConfig.id != null) {
        result.context = this._treeItemConfigs[newTreeItem.itemConfig.id];

        if (newTreeItem.itemConfig.parent !== null) {
            result.parentItem = this._treeItemConfigs[newTreeItem.itemConfig.parent];
        }

        placeholderOffset = this.m_placeholder.offset();
        offset = this.element.offset();
        result.position = new primitives.common.Rect(newTreeItem.actualPosition)
                .translate(placeholderOffset.left, placeholderOffset.top)
                .translate(-offset.left, -offset.top);
    }

    if (name != null) {
        result.name = name;
    }

    return result;
};
primitives.orgdiagram.Controller.prototype._createOrgTree = function () {
    var orgItem,
        userItem,
        index, len,
        index2, len2,
        property, properties,
        defaultItemConfig;

    // User API items defining organizationor family chart depending on implementation
	this._treeItemConfigs = {};  /* primitives.orgdiagram.ItemConfig or primitives.famdiagram.ItemConfig */

    // Organizational chart definition 
	this._orgItems = {};  /* primitives.orgdiagram.OrgItem */
	this._orgItemChildren = {}; /* key: primitives.orgdiagram.OrgItem.id value: array of primitives.orgdiagram.OrgItem.id having  OrgItem.parent equal to key */
	this._orgItemRoots = []; // primitives.orgdiagram.OrgItem

	if (this.options.items != null && this.options.items.length > 0) {
	    // Folowing properties we copy from user's item config to new OrgItem instance
	    // If user's property is undefined we take default value from ItemConfig
	    properties = [
            'title', 'description', 'image',
            'itemTitleColor', 'groupTitle', 'groupTitleColor',
            'isVisible', 'hasSelectorCheckbox', 'hasButtons',
            'itemType', 'adviserPlacementType', 'childrenPlacementType',
            'templateName', 'showCallout', 'calloutTemplateName',
            'label', 'showLabel', 'labelSize', 'labelOrientation', 'labelPlacement'];
	    defaultItemConfig = new primitives.orgdiagram.ItemConfig();

	    /* convert items to hash table */
	    for (index = 0, len = this.options.items.length; index < len; index += 1) {
	        userItem = this.options.items[index];
            /* user should define id for every ItemConfig otherwise we ignore it*/
	        if (userItem.id != null) {
	            this._treeItemConfigs[userItem.id] = userItem;

	            /* Organizational chart ItemConfig is almost the same as OrgItem 
                   except options used to draw connectors in multi parent chart
                */
	            orgItem = new primitives.orgdiagram.OrgItem();

                // OrgItem id coinsides with ItemConfig id since we don't add any new org items to user's org chart definition
	            orgItem.id = userItem.id;
	            orgItem.parent = userItem.parent;

	            /* Keep reference to user's ItemConfig in context */
	            orgItem.context = userItem;

	            /* copy general org chart items properties */
	            for (index2 = 0, len2 = properties.length; index2 < len2; index2+=1) {
	                property = properties[index2];

	                orgItem[property] = userItem[property] !== undefined ? userItem[property] : defaultItemConfig[property];
	            }

                // Collect children for every parent id
	            this._orgItems[orgItem.id] = orgItem;
	            if (this._orgItemChildren.hasOwnProperty(orgItem.parent)) {
	                this._orgItemChildren[orgItem.parent].push(orgItem);
	            } else {
	                this._orgItemChildren[orgItem.parent] = [orgItem];
	            }

	            /* collect all items having no parent, they are supposed to be roots */
	            if (orgItem.parent == null) {
	                this._orgItemRoots.push(orgItem);
	            }

	            /* We ignore looped items, it is applications responsibility to control data consistensy */
	        }
	    }
	}
};
primitives.orgdiagram.Buffer = function (options) {
    var index, len;

    this.polylines = [];
    this.cursor = 0;

    /* draw highlighted connectors */
    this._highlight = new primitives.orgdiagram.Polyline(options.highlightLinesColor, options.highlightLinesWidth, options.highlightLinesType);

    /* draw regular connectors */
    this._regular = new primitives.orgdiagram.Polyline(options.linesColor, options.linesWidth, options.linesType);

    if(options.linesPalette.length == 0) {
        /* draw regular connectors in default colors */
        this.polylines.push(new primitives.orgdiagram.Polyline(options.linesColor, options.linesWidth, options.linesType));
    } else {
        for(index = 0, len = options.linesPalette.length; index < len; index+=1) {
            this.polylines.push(new primitives.orgdiagram.Polyline(options.linesPalette[index]));
        }
    }
};

primitives.orgdiagram.Buffer.prototype.selectPalette = function (index) {
    this.cursor = index % this.polylines.length;
};

primitives.orgdiagram.Buffer.prototype.getPolyline = function (connectorStyleType) {
    var result = null;
    switch (connectorStyleType) {
        case 2/*primitives.common.ConnectorStyleType.Highlight*/:
            result = this._highlight;
            break;
        case 1/*primitives.common.ConnectorStyleType.Regular*/:
            result = this._regular;
            break;
        case 0/*primitives.common.ConnectorStyleType.Extra*/:
            result = this.polylines[this.cursor];
            break;
    }
    return result;
};

primitives.orgdiagram.Buffer.prototype.getPolylines = function () {
    var result = this.polylines.slice(0);
    result.push(this._highlight);
    result.push(this._regular);
    return result;
};
primitives.orgdiagram.ConnectorPoint = function () {
    this.parent = primitives.common.Point.prototype;
    this.parent.constructor.apply(this, arguments);

    this.isSquared = true;
    this.highlightPath = 0;
    
    this.connectorStyleType = 1/*primitives.common.ConnectorStyleType.Regular*/;
};

primitives.orgdiagram.ConnectorPoint.prototype = new primitives.common.Point();
primitives.orgdiagram.LevelVisibility = function (level, currentvisibility) {
	this.level = level;
	this.currentvisibility = currentvisibility;
};
/* This is model class is used to define intermediate organizational chart structure */
primitives.orgdiagram.OrgItem = function () {
    this.id = null; // Unique org item id. 
    this.parent = null; // Parent id. If parent is null then item placed as a root item.
    this.context = null; // Reference to user item config used to create this org item element


    this.title = null; // Default template title property.
    this.description = null; // Default template description element.
    this.image = null; // Url to image. This property is used in default template.

    this.itemTitleColor = "#4169e1"/*primitives.common.Colors.RoyalBlue*/; // Default template title background color.
    this.groupTitle = null; // Auxiliary group title property. Displayed vertically on the side of item.
    this.groupTitleColor = "#4169e1"/*primitives.common.Colors.RoyalBlue*/; //  Group title background color.

    this.isVisible = true; // If it is true then item is shown and selectable in hierarchy. 

    this.hasSelectorCheckbox = 0/*primitives.common.Enabled.Auto*/; //  If it is true then selection check box is shown for the item. 
    this.hasButtons = 0/*primitives.common.Enabled.Auto*/; // This option controls buttons panel visibility. 

    this.itemType = 0/*primitives.orgdiagram.ItemType.Regular*/; // This property defines how item should be placed in chart. 
    this.adviserPlacementType = 0/*primitives.common.AdviserPlacementType.Auto*/; // Left or Right placement relative to parent
    this.childrenPlacementType = 0/*primitives.common.ChildrenPlacementType.Auto*/; // Children shape

    this.templateName = null;
    this.showCallout = 0/*primitives.common.Enabled.Auto*/;
    this.calloutTemplateName = null;

    this.label = null;
    this.showLabel = 0/*primitives.common.Enabled.Auto*/;
    this.labelSize = null; // primitives.common.Size
    this.labelOrientation = 3/*primitives.text.TextOrientationType.Auto*/;
    this.labelPlacement = 0/*primitives.common.PlacementType.Auto*/;

    this.level = null;
    this.hideParentConnection = false;
    this.hideChildrenConnection = false;
};
primitives.orgdiagram.Polyline = function (arg0, arg1, arg2) {
    var property;

    this.lineColor = "#c0c0c0"/*primitives.common.Colors.Silver*/;
    this.lineWidth = 1;
	this.lineType = 0/*primitives.common.LineType.Solid*/;
	
	this.segments = [];

	switch (arguments.length) {
	    case 1:
	        for (property in arg0) {
	            if (arg0.hasOwnProperty(property)) {
	                this[property] = arg0[property];
	            }
	        }
	        break;
	    case 3:
	        this.lineColor = arg0;
	        this.lineWidth = arg1;
	        this.lineType = arg2;
	        break;
	}
};

primitives.orgdiagram.Polyline.prototype.toString = function () {
    return this.lineColor + "." + this.lineWidth + "." + this.lineType;
};
primitives.orgdiagram.PositionOffset = function (position, offset) {
    this.position = position;
    this.offset = offset;
};
primitives.orgdiagram.Template = function (templateConfig) {
	this.widgetEventPrefix = "orgdiagram";

	this.templateConfig = templateConfig;

	this.name = templateConfig.name;

	this.itemSize = templateConfig.itemSize;
	this.itemBorderWidth = templateConfig.itemBorderWidth;

	this.minimizedItemSize = templateConfig.minimizedItemSize;

	this.highlightPadding = templateConfig.highlightPadding;
	this.highlightBorderWidth = templateConfig.highlightBorderWidth;

	this.cursorPadding = templateConfig.cursorPadding;
	this.cursorBorderWidth = templateConfig.cursorBorderWidth;

	this.itemTemplate = templateConfig.itemTemplate;
	this.highlightTemplate = templateConfig.highlightTemplate;
	this.cursorTemplate = templateConfig.cursorTemplate;


	this.itemTemplateHashCode = null;
	this.itemTemplateRenderName = "onItemRender";

	this.highlightTemplateHashCode = null;
	this.highlightTemplateRenderName = "onHighlightRender";

	this.cursorTemplateHashCode = null;
	this.cursorTemplateRenderName = "onCursorRender";

	this.boxModel = jQuery.support.boxModel;
};


primitives.orgdiagram.Template.prototype.createDefaultTemplates = function (options) {

	if (primitives.common.isNullOrEmpty(this.itemTemplate)) {
		this.itemTemplate = this._getDefaultItemTemplate(options);
		this.itemTemplateRenderName = "onDefaultTemplateRender";
	}
	this.itemTemplateHashCode = primitives.common.hashCode(this.itemTemplate);

	if (primitives.common.isNullOrEmpty(this.cursorTemplate)) {
		this.cursorTemplate = this._getDefaultCursorTemplate(options);
		this.cursorTemplateRenderName = null;
	}
	this.cursorTemplateHashCode = primitives.common.hashCode(this.cursorTemplate);

	if (primitives.common.isNullOrEmpty(this.highlightTemplate)) {
		this.highlightTemplate = this._getDefaultHighlightTemplate();
		this.highlightTemplateRenderName = null;
	}
	this.highlightTemplateHashCode = primitives.common.hashCode(this.highlightTemplate);
};

primitives.orgdiagram.Template.prototype._getDefaultItemTemplate = function () {
	var contentSize = new primitives.common.Size(this.itemSize),
		itemTemplate,
		titleBackground,
		title,
		photoborder,
		photo,
		description;
	contentSize.width -= (this.boxModel ? this.itemBorderWidth * 2 : 0);
	contentSize.height -= (this.boxModel ? this.itemBorderWidth * 2 : 0);

	itemTemplate = jQuery('<div></div>')
        .css({
			"border-width": this.itemBorderWidth + "px"
        }).addClass("bp-item bp-corner-all bt-item-frame");

	titleBackground = jQuery('<div name="titleBackground"></div>')
		.css({
			top: "2px",
			left: "2px",
			width: (contentSize.width - 4) + "px",
			height: "18px"
        }).addClass("bp-item bp-corner-all bp-title-frame");

	itemTemplate.append(titleBackground);

	title = jQuery('<div name="title"></div>')
		.css({
			top: "1px",
			left: "4px",
			width: (contentSize.width - 4 - 4 * 2) + "px",
			height: "16px"
		}).addClass("bp-item bp-title");

	titleBackground.append(title);

	photoborder = jQuery("<div></div>")
		.css({
			top: "24px",
			left: "2px",
			width: "50px",
			height: "60px"
		}).addClass("bp-item bp-photo-frame");

	itemTemplate.append(photoborder);

	photo = jQuery('<img name="photo" alt=""></img>')
		.css({
			width: "50px",
			height: "60px"
		});
	photoborder.append(photo);

	description = jQuery('<div name="description"></div>')
	.css({
		top: "24px",
		left: "56px",
		width: (contentSize.width - 4 - 56) + "px",
		height: "74px"
	}).addClass("bp-item bp-description");

	itemTemplate.append(description);

	return itemTemplate.wrap('<div>').parent().html();
};

primitives.orgdiagram.Template.prototype._getDefaultCursorTemplate = function (options) {
	var cursorTemplate = jQuery("<div></div>")
	.css({
		width: (this.itemSize.width + this.cursorPadding.left + this.cursorPadding.right) + "px",
		height: (this.itemSize.height + this.cursorPadding.top + this.cursorPadding.bottom) + "px",
		"border-width": this.cursorBorderWidth + "px"
	}).addClass("bp-item bp-corner-all bp-cursor-frame");

	return cursorTemplate.wrap('<div>').parent().html();
};

primitives.orgdiagram.Template.prototype._getDefaultHighlightTemplate = function () {
	var highlightTemplate = jQuery("<div></div>")
	.css({
		"border-width": this.highlightBorderWidth + "px"
	}).addClass("bp-item bp-corner-all bp-highlight-frame");

	return highlightTemplate.wrap('<div>').parent().html();
};
/* This is model class used to define visual structure of chart */
primitives.orgdiagram.TreeItem = function (id) {
    // User item config 
    this.itemConfig = null;
    // Org Chart Item definition
    this.orgItem = null;

    /* auto generated internal item id */
    this.id = id;

    /* parent/childrern relations between items used for navigation */
	this.logicalParents = [];
	this.logicalChildren = [];

    /* parent/childrern relations used to draw hierarchy */
	this.visualParentId = null;
	this.visualChildren = [];
	
    /* Item used to align visual children relative to visual parent, aggregator aims at child being straight under it */
	this.visualAggregatorId = null;

	this.relocatedTo = null;
	this.partners = []; /* thess are nodes connected with bottom line together into one family, family is group of items having common set of children */

	this.extraPartners = []; /* this is partners which are not part of organizational chart tree, but must be connected */
	this.extraChildren = []; /* this is children which are not in the list of visual children, but must be connected, 
                                family chart garantees that they are at the same level as its children*/
	this.partnerConnectorOffset = 0;
	this.childrenConnectorOffset = 0;

	this.parentsConnectionsCount = 0; /* this is number of incoming connections */
	this.parentsConnectionsIndex = 0; /* this is number of incoming connections used */

	this.visibility = 1/*primitives.common.Visibility.Normal*/;

	this.template = null;

	this.level = null;
	this.levelPosition = null;
	this.offset = 0;
	this.leftPadding = 0;
	this.rightPadding = 0;

	this.actualVisibility = 1/*primitives.common.Visibility.Normal*/;
	this.actualSize = null;
	this.actualPosition = null;
	this.contentPosition = null;

	this.isCursor = false;
	this.isSelected = false;

	this.actualHasSelectorCheckbox = false;
	this.actualHasButtons = false;
	this.actualHasGroupTitle = false;

	this.actualItemType = null; // primitives.orgdiagram.ItemType
	this.connectorPlacement = 0; // primitives.common.SideFlag
	this.gravity = 0; // primitives.common.HorizontalAlignmentType.Center
	this.highlightPath = 0;
	this.partnerHighlightPath = 0;

    /* This value is used to increase gap between neighboring left item in hiearchy */
	this.relationDegree = 0;
};

primitives.orgdiagram.TreeItem.prototype.setActualSize = function (treeLevel, options) {
	var common = primitives.common;
	this.actualVisibility = (this.visibility === 0/*primitives.common.Visibility.Auto*/) ? treeLevel.currentvisibility : this.visibility;

	switch (this.actualVisibility) {
		case 1/*primitives.common.Visibility.Normal*/:
			this.actualSize = new common.Size(this.template.itemSize);
			this.contentPosition = new common.Rect(0, 0, this.actualSize.width, this.actualSize.height);
			if (this.isCursor) {
				this.actualSize.height += this.template.cursorPadding.top + this.template.cursorPadding.bottom;
				this.actualSize.width += this.template.cursorPadding.left + this.template.cursorPadding.right;
				this.contentPosition.x = this.template.cursorPadding.left;
				this.contentPosition.y = this.template.cursorPadding.top;
			}
			if (this.actualHasSelectorCheckbox) {
				this.actualSize.height += options.checkBoxPanelSize;
			}
			if (this.actualHasButtons) {
				this.actualSize.width += options.buttonsPanelSize;
			}
			this.actualHasGroupTitle = !common.isNullOrEmpty(this.orgItem.groupTitle);
			if (this.actualHasGroupTitle) {
				this.actualSize.width += options.groupTitlePanelSize;
				this.contentPosition.x += options.groupTitlePanelSize;
			}
			break;
		case 2/*primitives.common.Visibility.Dot*/:
			this.actualSize = new common.Size(this.template.minimizedItemSize);
			break;
		case 3/*primitives.common.Visibility.Line*/:
		case 4/*primitives.common.Visibility.Invisible*/:
			this.actualSize = new common.Size();
			break;
	}

	switch (options.orientationType) {
		case 2/*primitives.common.OrientationType.Left*/:
		case 3/*primitives.common.OrientationType.Right*/:
			this.actualSize.invert();
			break;
	}
};

primitives.orgdiagram.TreeItem.prototype.setActualPosition = function (treeLevel, options) {
	var itemShift = 0;
	switch (options.verticalAlignment) {
		case 0/*primitives.common.VerticalAlignmentType.Top*/:
			itemShift = 0;
			break;
		case 1/*primitives.common.VerticalAlignmentType.Middle*/:
			itemShift = (treeLevel.depth - this.actualSize.height) / 2.0;
			break;
		case 2/*primitives.common.VerticalAlignmentType.Bottom*/:
			itemShift = treeLevel.depth - this.actualSize.height;
			break;
	}

	this.actualPosition = new primitives.common.Rect(this.offset, treeLevel.shift + itemShift, this.actualSize.width, this.actualSize.height);

	switch (options.orientationType) {
		case 2/*primitives.common.OrientationType.Left*/:
		case 3/*primitives.common.OrientationType.Right*/:
			this.actualSize.invert();
			break;
	}
};

primitives.orgdiagram.TreeItem.prototype.toString = function () {
	return this.id;
};
primitives.orgdiagram.TreeItemsGroup = function (treeItem) {
    /* this class is used to sort tree items by distance between its first and last partner */
    this.treeItem = treeItem;
    this.startIndex = null;
    this.endIndex = null;
};

primitives.orgdiagram.TreeItemsGroup.prototype.toString = function () {
    return "[" + Math.round(this.startIndex) + " - " + Math.round(this.endIndex) + "]";
};
primitives.orgdiagram.TreeLevel = function (level) {
	this.level = level;
	this.currentvisibility = 1/*primitives.common.Visibility.Normal*/;
	this.actualVisibility = 1/*primitives.common.Visibility.Normal*/;
	

	this.shift = 0.0;
	this.depth = 0.0;
	this.nextLevelShift = 0.0;
	this.currentOffset = 0.0;

	this.topConnectorShift = 0.0;
	this.connectorShift = 0.0;
	this.levelSpace = 0.0;

	this.partnerConnectorOffset = 0;
	this.childrenConnectorOffset = 0;

	this.treeItems = [];

	this.labels = [];
	this.labelsRect = null;
	this.showLabels = true;
	this.hasFixedLabels = false;
};

primitives.orgdiagram.TreeLevel.prototype.toString = function () {
	return this.level + "." + this.currentvisibility;
};
/*
 * jQuery UI Diagram
 *
 * Basic Primitives organization diagram.
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function ($) {
    $.widget("ui.orgDiagram", jQuery.ui.mouse2, new primitives.orgdiagram.Controller());
}(jQuery));
/*
    Class: primitives.connector.Config
	    Connector options class.
	
*/
primitives.shape.Config = function () {
    this.classPrefix = "bpconnector";

	/*
	    Property: graphicsType
            Preferable graphics type. If preferred graphics type is not supported widget switches to first available. 

		Default:
			<primitives.common.GraphicsType.SVG>
    */
	this.graphicsType = 1/*primitives.common.GraphicsType.Canvas*/;

	/*
    Property: actualGraphicsType
        Actual graphics type.
    */
	this.actualGraphicsType = null;

    /*
		Property: orientationType
			Diagram orientation. 

		Default:
			<primitives.common.OrientationType.Top>
    */
	this.orientationType = 0/*primitives.common.OrientationType.Top*/;

    /*
		Property: shapeType
			Shape type. 

		Default:
			<primitives.common.ShapeType.Rectangle>
    */
	this.shapeType = 0/*primitives.common.ShapeType.Rectangle*/;

	/*
	Property: position
	    Defines shapes rectangle position. 
        
    Type:
        <primitives.common.Rect>.
    */
	this.position = null;

	/*
    Property: offset
        Connector's from and to points offset off the rectangles side. Connectors connection points can be outside of rectangles and inside for negative offset value.
    See also:
        <primitives.common.Thickness>
    */
	this.offset = new primitives.common.Thickness(0, 0, 0, 0);

	/*
    Property: lineWidth
        Border line width. 
    */
	this.lineWidth = 2;

    /*
    Property: cornerRadius
        Body corner radius in percents or pixels. 
    */
	this.cornerRadius = "10%";

    /*
    Property: opacity
        Background color opacity. 
    */
	this.opacity = 1;

	/*
    Property: borderColor
        Shape border line color.
    
    Default:
        <primitives.common.Colors.Black>
    */
	this.borderColor = null;

    /*
    Property: fillColor
        Fill Color. 
    
    Default:
        <primitives.common.Colors.Gray>
    */
	this.fillColor = null;

    /*
    Property: lineType
        Connector's line pattern.

    Default:
        <primitives.common.LineType.Solid>
    */
	this.lineType = 0/*primitives.common.LineType.Solid*/;


    /*
    Property: label
        Annotation label text. Label styled with css class name "bp-connector-label".
    */
	this.label = null;

    /*
	Property: labelSize
		Defines label size. It is needed to preserve space for label without overlapping connected items.

	Default:
		new <primitives.common.Size>(60, 30);
	*/
	this.labelSize = new primitives.common.Size(60, 30);

    /*
    Property: labelPlacement
        Defines label placement relative to the shape. 

    See Also:
        <primitives.orgdiagram.Config.labelPlacement>
        <primitives.common.PlacementType>

    Default:
        <primitives.common.PlacementType.Auto>
    */
	this.labelPlacement = 0/*primitives.common.PlacementType.Auto*/;

    /*
    Property: labelOffset
        Defines label offset from shape in pixels.

    Default:
        4;
    */
	this.labelOffset = 4;

	/*
	method: update
	    Makes full redraw of connector widget contents reevaluating all options.
    */
};
primitives.shape.Controller = function () {
	this.widgetEventPrefix = "bpshape";

	this.options = new primitives.shape.Config();

	this.m_placeholder = null;
	this.m_panelSize = null;

	this.m_graphics = null;

	this.m_shape = null;

	this._labelTemplate = null;
	this._labelTemplateHashCode = null;
};

primitives.shape.Controller.prototype._create = function () {
    var self = this;

	this.element
			.addClass("ui-widget");

	this._createLabelTemplate();
	this._createLayout();

	this.options.onAnnotationLabelTemplateRender = function (event, data) { self._onAnnotationLabelTemplateRender(event, data); };

	this._redraw();
};

primitives.shape.Controller.prototype.destroy = function () {
    this._cleanLayout();

    this.options.onLabelTemplateRender = null;
};

primitives.shape.Controller.prototype._createLayout = function () {
	this.m_panelSize = new primitives.common.Rect(0, 0, this.element.outerWidth(), this.element.outerHeight());

	this.m_placeholder = jQuery('<div></div>');
	this.m_placeholder.css({
		"position": "relative",
		"overflow": "hidden",
		"top": "0px",
		"left": "0px",
		"padding": "0px",
		"margin": "0px"
	});
	this.m_placeholder.css(this.m_panelSize.getCSS());
	this.m_placeholder.addClass("placeholder");
	this.m_placeholder.addClass(this.widgetEventPrefix);

	this.element.append(this.m_placeholder);

	this.m_graphics = primitives.common.createGraphics(this.options.graphicsType, this);

	this.options.actualGraphicsType = this.m_graphics.graphicsType;
};

primitives.shape.Controller.prototype._cleanLayout = function () {
	if (this.m_graphics !== null) {
		this.m_graphics.clean();
	}
	this.m_graphics = null;

	this.element.find("." + this.widgetEventPrefix).remove();
};

primitives.shape.Controller.prototype._updateLayout = function () {
	this.m_panelSize = new primitives.common.Rect(0, 0, this.element.innerWidth(), this.element.innerHeight());
	this.m_placeholder.css(this.m_panelSize.getCSS());
};

primitives.shape.Controller.prototype.update = function (recreate) {
	if (recreate) {
		this._cleanLayout();
		this._createLayout();
		this._redraw();
	}
	else {
		this._updateLayout();
		this.m_graphics.resize("placeholder", this.m_panelSize.width, this.m_panelSize.height);
		this.m_graphics.begin();
		this._redraw();
		this.m_graphics.end();
	}
};

primitives.shape.Controller.prototype._createLabelTemplate = function () {
    var template = jQuery('<div></div>');
    template.addClass("bp-item bp-corner-all bp-connector-label");

    this._labelTemplate = template.wrap('<div>').parent().html();
    this._labelTemplateHashCode = primitives.common.hashCode(this._labelTemplate);
};

primitives.shape.Controller.prototype._onAnnotationLabelTemplateRender = function (event, data) {//ignore jslint
    var label = data.element.html(this.options.label);
};

primitives.shape.Controller.prototype._redraw = function () {
    var names = ["orientationType", "shapeType", "offset", "lineWidth", "borderColor", "lineType", "labelSize", "labelOffset", "labelPlacement", "cornerRadius", "opacity", "fillColor"],
		index,
		name;
    this.m_graphics.activate("placeholder");

    this.m_shape = new primitives.common.Shape(this.m_graphics);
	for (index = 0; index < names.length; index += 1) {
	    name = names[index];
        this.m_shape[name] = this.options[name];
	}
	this.m_shape.hasLabel = !primitives.common.isNullOrEmpty(this.options.label);
	this.m_shape.labelTemplate = this._labelTemplate;
	this.m_shape.labelTemplateHashCode = this._labelTemplateHashCode;
	this.m_shape.panelSize = new primitives.common.Size(this.m_panelSize.width, this.m_panelSize.height);
	this.m_shape.draw(this.options.position);
};

primitives.shape.Controller.prototype._setOption = function (key, value) {
	jQuery.Widget.prototype._setOption.apply(this, arguments);

	switch (key) {
		case "disabled":
			var handles = jQuery([]);
			if (value) {
				handles.filter(".ui-state-focus").blur();
				handles.removeClass("ui-state-hover");
				handles.propAttr("disabled", true);
				this.element.addClass("ui-disabled");
			} else {
				handles.propAttr("disabled", false);
				this.element.removeClass("ui-disabled");
			}
			break;
		default:
			break;
	}
};
/*
 * jQuery UI Shape
 *
 * Basic Primitives Shape.
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function ($) {
    $.widget("ui.bpShape", new primitives.shape.Controller());
}(jQuery));

