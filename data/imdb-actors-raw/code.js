const width = 600
const height = 400

const createSVGElement = (name) => {
    return document.createElementNS("http://www.w3.org/2000/svg", name)
}

const svg = createSVGElement("svg")
svg.setAttribute("width", width)
svg.setAttribute("height", height)

const id2node = {}
const size = 40
data.nodes.forEach((node) => {
    id2node[node.id] = node
    node.size = size
})

function scaleLinear(domain, range) {
    const ratio = (range[1] - range[0]) / (domain[1] - domain[0])
    return function (x) {
        return (x - domain[0]) * ratio + range[0]
    }
}

const xScale = scaleLinear([0, data.nodes.length], [width * 0.1, width * 0.9])
const yScale = scaleLinear([0, data.nodes.length], [height * 0.1, height * 0.9])

data.nodes
    .map((n, i) => ({ i, n }))
    .sort((a, b) => a.n.votes - b.n.votes)
    .forEach(({ n }, i) => {
        n.x = xScale(i)
    })

data.nodes
    .map((n, i) => ({ i, n }))
    .sort((a, b) => a.n.avg_vote - b.n.avg_vote)
    .forEach(({ n }, i) => {
        n.y = yScale(i)
    })

const linkGroup = createSVGElement("g")
linkGroup.setAttribute("stroke", "#00000055")
linkGroup.setAttribute("stroke-opacity", 0.6)

svg.appendChild(linkGroup)

data.links.forEach((link) => {
    const line = createSVGElement("line")
    linkGroup.appendChild(line)
    line.setAttribute("stroke-width", link["number_of_common_movies"] * 2)
    line.setAttribute("x1", id2node[link.source].x)
    line.setAttribute("y1", id2node[link.source].y)
    line.setAttribute("x2", id2node[link.target].x)
    line.setAttribute("y2", id2node[link.target].y)
})

const nodeGroup = createSVGElement("g")
svg.appendChild(nodeGroup)

data.nodes.forEach((node) => {
    const rect = createSVGElement("rect")
    nodeGroup.appendChild(rect)

    rect.setAttribute("x", node.x - node.size / 2)
    rect.setAttribute("y", node.y - node.size / 2)
    rect.setAttribute("height", node.size)
    rect.setAttribute("width", node.size)
    rect.setAttribute("fill", "#ffffff")
    rect.setAttribute("stroke", "#000000")
    rect.setAttribute("stroke-width", "2.5")
})

const textGroup = createSVGElement("g")
svg.appendChild(textGroup)

data.nodes.forEach((node) => {
    const text = createSVGElement("text")
    textGroup.appendChild(text)
    const name = node.name
        .split(/[\s|-]/)
        .map((_) => _[0] + ".")
        .join(" ")
    text.setAttribute("x", node.x)
    text.setAttribute("y", node.y - node.size * 0.4)
    text.setAttribute("text-anchor", "middle")
    text.setAttribute("alignment-baseline", "hanging")
    text.setAttribute("fill", "#000000")
    text.setAttribute("style", "font-size:10px;")
    text.textContent = name
})

const yearRange = [2016, 2020]
const numberOfMoviesByYearRange = [Infinity, -Infinity]
data.nodes.forEach((n) => {
    for (let year in n["number_of_movies_by_year"]) {
        const num = n["number_of_movies_by_year"][year]
        numberOfMoviesByYearRange[0] = Math.min(
            numberOfMoviesByYearRange[0],
            num
        )
        numberOfMoviesByYearRange[1] = Math.max(
            numberOfMoviesByYearRange[1],
            num
        )
    }
})

const lineXScale = scaleLinear(yearRange, [-size * 0.3, size * 0.3])
const lineYScale = scaleLinear(numberOfMoviesByYearRange, [
    -size * 0,
    size * 0.4,
])

const lineChartsGroup = createSVGElement("g")
svg.appendChild(lineChartsGroup)

data.nodes.forEach((node) => {
    const g = createSVGElement("g")
    g.setAttribute("transform", `translate(${node.x}, ${node.y})`)
    lineChartsGroup.appendChild(g)

    const lineChartLinksData = (d) => {
        const pos = Object.entries(d.number_of_movies_by_year).map(
            ([year, num]) => {
                return {
                    x: lineXScale(year),
                    y: lineYScale(num),
                }
            }
        )

        const links = []
        for (let i = 0; i < pos.length - 1; i++) {
            links.push({
                source: pos[i],
                target: pos[i + 1],
            })
        }
        return links
    }

    const linksData = lineChartLinksData(node)
    linksData.forEach((link) => {
        const line = createSVGElement("line")
        g.appendChild(line)
        line.setAttribute("x1", link.source.x)
        line.setAttribute("y1", link.source.y)
        line.setAttribute("x2", link.target.x)
        line.setAttribute("y2", link.target.y)
        line.setAttribute("stroke", "red")
        line.setAttribute("fill", "transparent")
        line.setAttribute("stroke-width", 1.5)
        line.setAttribute("stroke-linejoin", "round")
        line.setAttribute("stroke-linecap", "round")
    })
})

/*

const yearRange = [2016, 2020]
const numberOfMoviesByYearRange = [Infinity, -Infinity]
data.nodes.forEach((n) => {
    for (let year in n["number_of_movies_by_year"]) {
        const num = n["number_of_movies_by_year"][year]
        numberOfMoviesByYearRange[0] = Math.min(
            numberOfMoviesByYearRange[0],
            num
        )
        numberOfMoviesByYearRange[1] = Math.max(
            numberOfMoviesByYearRange[1],
            num
        )
    }
})

const lineXScale = d3
    .scaleLinear()
    .domain(yearRange)
    .range([-size * 0.3, size * 0.3])

const lineYScale = d3
    .scaleLinear()
    .domain(numberOfMoviesByYearRange)
    .range([-size * 0.1, size * 0.1])

const linecharts = svg
    .append("g")
    .selectAll("g")
    .data(data.nodes)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
    .selectAll("line")
    .data((d) => {
        const pos = Object.entries(d.number_of_movies_by_year).map(
            ([year, num]) => {
                return {
                    x: lineXScale(year),
                    y: lineYScale(num),
                }
            }
        )

        const links = []
        for (let i = 0; i < pos.length - 1; i++) {
            links.push({
                source: pos[i],
                target: pos[i + 1],
            })
        }
        return links
    })
    .enter()
    .append("line")
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y)
    .attr("stroke", "red")
    .attr("fill", "transparent")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
*/

return svg
