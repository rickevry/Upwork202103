function Component1(props: any) {
    const [css, setCss] = React.useState("");

    React.useEffect(() => {
        BridgeStyling.loadStyle("./src/Component1.scss").then(css => {
            setCss(css);
        });
    });
    
    if (!css) return null;
    let className = BridgeStyling.useStyle(css);

    return (
        <div className={className}>
            {/* Build component here */}
            {/* You do not have not write React code, normal HTML is also OK */}
            <span>Hello world</span>
        </div>
    )
}