'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';

export interface ValueNode {
  id: string;
  label: string;
  level: 'terminal' | 'instrumental' | 'functional' | 'physical';
  frequency: number;
  sentiment: number; // -1 to 1
  children?: ValueNode[];
  parent?: string;
}

interface ValueTreeProps {
  data: ValueNode[];
  width?: number;
  height?: number;
  className?: string;
}

const LEVEL_COLORS = {
  terminal: '#10b981', // emerald-500
  instrumental: '#3b82f6', // blue-500
  functional: '#f59e0b', // amber-500
  physical: '#6b7280', // gray-500
};

const LEVEL_SIZES = {
  terminal: 50,
  instrumental: 40,
  functional: 35,
  physical: 30,
};

export function ValueTree({ data, width = 800, height = 600, className }: ValueTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<ValueNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // 階層データの構築
    const root = d3.hierarchy(buildHierarchy(data));
    const treeLayout = d3.tree<ValueNode>().size([height - 100, width - 200]);
    const treeData = treeLayout(root);

    // ズーム・パン機能
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g')
      .attr('transform', 'translate(100,50)');

    // リンクの描画
    const links = g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<ValueNode>, d3.HierarchyPointNode<ValueNode>>()
        .x((d) => d.y)
        .y((d) => d.x))
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2);

    // ノードの描画
    const nodes = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer');

    // ノード円
    nodes.append('circle')
      .attr('r', (d) => LEVEL_SIZES[d.data.level] / 2)
      .attr('fill', (d) => LEVEL_COLORS[d.data.level])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('opacity', (d) => {
        const freq = d.data.frequency || 1;
        return Math.min(1, 0.5 + freq * 0.5);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.data);
        if (d.children) {
          // 折りたたみ
          d._children = d.children;
          d.children = undefined;
        } else if (d._children) {
          // 展開
          d.children = d._children;
          d._children = undefined;
        }
        // 再描画
        update();
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-width', 3);
        showTooltip(event, d.data);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 2);
        hideTooltip();
      });

    // ラベル
    nodes.append('text')
      .attr('dy', (d) => LEVEL_SIZES[d.data.level] / 2 + 20)
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#1e293b')
      .text((d) => d.data.label)
      .call(wrap, 100);

    // ツールチップ
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'fixed bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 pointer-events-none opacity-0 transition-opacity')
      .style('font-size', '12px');

    function showTooltip(event: MouseEvent, node: ValueNode) {
      tooltip
        .html(`
          <div class="font-semibold mb-1">${node.label}</div>
          <div class="text-slate-600">レベル: ${node.level}</div>
          <div class="text-slate-600">出現頻度: ${node.frequency}</div>
          <div class="text-slate-600">感情スコア: ${node.sentiment.toFixed(2)}</div>
        `)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY + 10}px`)
        .style('opacity', 1);
    }

    function hideTooltip() {
      tooltip.style('opacity', 0);
    }

    function wrap(text: d3.Selection<SVGTextElement, d3.HierarchyPointNode<ValueNode>, SVGGElement, unknown>, width: number) {
      text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word: string | undefined;
        let line: string[] = [];
        let lineNumber = 0;
        const lineHeight = 1.2;
        const y = text.attr('y');
        const dy = parseFloat(text.attr('dy') || '0');
        let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', `${dy}em`);
        
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(' '));
          if (tspan.node()?.getComputedTextLength() && tspan.node()!.getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', `${++lineNumber * lineHeight + dy}em`).text(word);
          }
        }
      });
    }

    function update() {
      // 再描画ロジック（簡易版）
      // 実際の実装では、より詳細な更新が必要
    }

    return () => {
      tooltip.remove();
    };
  }, [data, width, height]);

  // 階層構造を構築
  function buildHierarchy(nodes: ValueNode[]): ValueNode {
    const nodeMap = new Map<string, ValueNode>();
    let root: ValueNode | null = null;

    // ノードマップを作成
    nodes.forEach((node) => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // 親子関係を構築
    nodes.forEach((node) => {
      const currentNode = nodeMap.get(node.id)!;
      if (node.parent) {
        const parent = nodeMap.get(node.parent);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(currentNode);
        }
      } else {
        root = currentNode;
      }
    });

    return root || nodes[0];
  }

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-slate-200 rounded-lg bg-white"
      />
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white border border-slate-200 rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold mb-2">{selectedNode.label}</h3>
          <div className="text-sm text-slate-600 space-y-1">
            <div>レベル: {selectedNode.level}</div>
            <div>出現頻度: {selectedNode.frequency}</div>
            <div>感情スコア: {selectedNode.sentiment.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

