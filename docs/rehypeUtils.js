import { visit } from "@astrojs/starlight/expressive-code/hast";

const rehypeCenterMermaidGraphs = () => {
    return (tree) => {
        visit(tree, 'element', (node, index, parent) => {
            if (node.tagName === 'img') {
                const split = node.properties.id.split('-');
                if (split.length !== 2) return;
                if (split[0] !== 'mermaid') return; 

                node.properties.className = node.properties.className || [];
                node.properties.className.push('mx-auto');
            }
        });
    };
}

export default rehypeCenterMermaidGraphs