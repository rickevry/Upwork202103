// https://stackoverflow.com/questions/1720320/how-to-dynamically-create-css-class-in-javascript-and-apply

// import * as React from 'react';

let style: HTMLStyleElement = undefined;
let styleCounter = 100;
let cache: any = {};
let myContextValue = {};
let myContext = null;
let cachedFuncs: any = {};
let classNameDict: any = {};

interface CachedFunc {
    rules: CachedRule[];
    func: any;
}

interface CachedRule {
    dependencies: any[];
    className: any;
}

let removeComments = (css: string) => {
    css = css || "";
    let re = /\/\*(.|[\r\n])*?\*\//;
    return css.replace(re, "");
}

let init = () => {
    myContext = React.createContext(myContextValue)
    style = document.createElement('style');
    style.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(style);
}

let fixStyle = (className: string, css: string, props: any) => {

    css = removeComments(css);
    // console.log("fix style", css, props);
    props = props || {};
    if (!css.substring) {
        debugger;
    }

    let css1 = "";
    if (css.startsWith("*")) {
        css1 = css.substring(1);
        console.error("not supported");
    } else {
        css1 = css.split(".component").join("." + className);
    }

    let css2 = fixProps(css1, props);
    return css2;
}

let fixProps = (css: string, props: any) => {
    let result = css;
    let r = null;
    let re = /≤(.*?)≥/;
    while ((r = re.exec(result)) !== null) {
        const str = r[0];
        const key = r[1];
        const value = props[key];
        result = result.replace(str, value);
        // console.log("r",r);
        // debugger;
    }
    // console.log("result", result);
    return result;
}

let insertCss = (css: string) => {
    if (!style) {
        init();
    }
    // console.log("insert rule", css);
    // css = "aaaaa\r\n. { sfkj\r\n\r\nkfdsf } skjhfhd\r\nshasd sa sa dsa. adasdasdsa { dsasd sadsad } "
    let r = null;
    let re = /(\..*?})/sg;
    while ((r = re.exec(css)) !== null) {
        const str = r[0];
        // console.log("insert rule result", str);
        style.sheet.insertRule(str, 0);
    }
}

let createStyle = (name: string, css: string, props: any = null) => {
    debugger;
    if (!style) {
        init();
    }
    if (cache[name]) {
        return cache[name];
    }
    styleCounter++;
    let className = "BS_" + styleCounter;
    style.sheet.insertRule(fixStyle(className, css, props), 0);
    cache[name] = className;
    return className;
}
let useNamedStyle = (name: string, css: string, func: any = null, dependencies: any[] = null) => {
    return useStyleInternal(name, css, func, dependencies);
}
let useStyle = (css: string, func: any = null, dependencies: any[] = null) => {
    return useStyleInternal(undefined, css, func, dependencies);
}

let replaceVariables = (css:string) => {

    var myregexp = /^(\$.+?):(.+?);/m;
    var match = myregexp.exec(css);
    while (match != null) {
        console.log("replaceVariables", match[0]);
        let variableName = match[1];
        let variableValue = match[2];
        css = css.replace(match[0], "");
        css = css.replaceAll(variableName, variableValue);
	    match = myregexp.exec(css);
    }

    console.log("hejsan");
    return css;
}

let useStyleInternal = (name: string, css: string, func: any = null, dependencies: any[] = null) => {
    dependencies = dependencies || [];
    dependencies = [css, ...dependencies];

    func = func || (() => ({}));
    css = css || "";
    css = replaceVariables(css);

    let dict = classNameDict;
    let prevDict = undefined;
    let currentDependency = undefined;
    for (let t = 0; t < dependencies.length; t++) {
        currentDependency = dependencies[t];
        let nextDict = dict[currentDependency];
        if (!nextDict) {
            nextDict = {};
            if (!dict) {
                debugger;
            }
            dict[currentDependency] = nextDict;
        }
        prevDict = dict;
        dict = nextDict;
    }

    if (typeof dict == "string") {
        return dict;
    } else {
        styleCounter++;
        let className = name || "BS_" + styleCounter;
        const props = func ? func() : {};
        let newCss = fixStyle(className, css, props);
        insertCss(newCss);
        prevDict[currentDependency] = className;
        return className;
    }
}

let useStyle2 = (css: string, func: any, dependencies: any[]) => {
    dependencies = dependencies || [];
    func = func || (() => ({}));
    css = css || "";

    // let funcItem: CachedFunc = (cachedFuncs[func] as CachedFunc);
    let funcItem: CachedFunc = cachedFuncs[func];
    if (!funcItem) {
        funcItem = {
            rules: [],
            func: func
        };
        cachedFuncs[func] = funcItem;
    } else {
        // console.log("are they the same1", func === funcItem.func );
        // console.log("are they the same2", func == funcItem.func );
        // debugger;
    }

    for (var t = 0; t < funcItem.rules.length; t++) {
        const rule = funcItem.rules[t];
        let fail = false;
        if (!(dependencies.length == 0 && rule.dependencies.length == 0)) {
            for (var tt = 0; tt < rule.dependencies.length; tt++) {
                if (rule.dependencies[tt] != dependencies[tt]) {
                    fail = true;
                    break;
                }
            }
        }
        if (!fail) {
            console.log("found");
            return rule.className;
        }
    }

    console.log("did not find");

    styleCounter++;
    let className = "BS_" + styleCounter;
    const props = func();
    let newCss = fixStyle(className, css, props);

    insertCss(newCss);
    // style.sheet.insertRule(newCss, 0);

    funcItem.rules.push({
        className: className,
        dependencies: [...dependencies]
    });

    return className;
}

let useStyleOld = (css: string, props: any, dep: any) => {
    if (!style) {
        init();
    }
    let rule = React.useMemo(() => {
        console.log("creating style", dep);
        styleCounter++;
        let className = "BS_" + styleCounter;
        style.sheet.insertRule(fixStyle(className, css, props), 0);
        console.log("created style", rule);
    }, [...dep]);
    // }, [...dep]);
    return rule;
}

let useStyleConstants = () => ({
    SELECTED: "62a657c10ce9",
    ACTIVE: "f40fa0d98b03",
    INACTIVE: "5adc56a0e823",
    EMPTY: "",
    NONE: "",
})

// For TS intellisense
declare var BridgeStyling: {
    loadStyle: typeof loadStyle;
    useStyle: typeof useStyle;
    cssClassName: { [key: string]: string };
}

let loadStyle = (styleName:string) : Promise<string> => {
    return new Promise(resolve => {
        fetch(styleName).then((response) => {
            return response.text()
        }).then((txt) => {
            resolve(txt);
        }).catch(() => alert("Load style error"));
    })
}

window["BridgeStyling"] = {
    loadStyle: loadStyle,
    useStyle: useStyle,
    cssClassName: {}
};