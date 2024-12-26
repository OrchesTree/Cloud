'use client';
import { useEffect, useRef } from 'react';
import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.draggable.js';
import '@svgdotjs/svg.select.js';
import '@svgdotjs/svg.resize.js';
import './svg.resize.css';
import Navbar from '@/components/Navbar';

const EditorPage = () => {
  const svgContainerRef = useRef(null);
  const drawRef = useRef(null);
  const selectedGroupRef = useRef(null);
  const highlightRectRef = useRef(null);
  const hoveredGroupRef = useRef(null);
  const originalBBoxRef = useRef(null); // For resizing calculations

  useEffect(() => {
    if (!svgContainerRef.current) return;

    try {
      drawRef.current = SVG().addTo(svgContainerRef.current).size('100%', '100%');

      const storedSVG = sessionStorage.getItem('svgData');
      if (!storedSVG) return;

      const importedSVG = drawRef.current.svg(storedSVG);

      // Fit the rendered SVG to container
      const fitSVGToContainer = () => {
        const container = svgContainerRef.current;
        const svgElement = container.querySelector('svg');
        if (container && svgElement) {
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          const bbox = svgElement.getBBox();
          svgElement.setAttribute('viewBox', `0 0 ${bbox.width} ${bbox.height}`);
          svgElement.setAttribute('width', containerWidth);
          svgElement.setAttribute('height', containerHeight);
          svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }
      };
      setTimeout(fitSVGToContainer, 0);

      // Make shapes hoverable
      importedSVG.find('path, rect, circle, ellipse, polygon, text').forEach(el => {
        el.attr({ 'pointer-events': 'fill' });
      });

      // Wrap shapes in groups with invisible rect to ensure stable bounding boxes
      wrapShapesWithClickableRect(importedSVG);

      // Now our interactive elements are groups with data-draggable
      const interactiveGroups = importedSVG.find('g[data-draggable]');

      // Create highlight rectangle
      const highlightRect = importedSVG.rect(0, 0)
        .fill('none')
        .stroke({ color: 'red', width: 2 })
        .attr({ 'pointer-events': 'none' })
        .hide();
      highlightRectRef.current = highlightRect;

      // Deselect all helper
      const deselectAll = () => {
        if (selectedGroupRef.current) {
          selectedGroupRef.current.select(false);
          selectedGroupRef.current.resize('stop');
          selectedGroupRef.current = null;
        }
      };

      // Handle selection
      const handleSelect = (group) => {
        deselectAll();

        selectedGroupRef.current = group;
        group.select({ deepSelect: false }).resize({ deepSelect: false });

        group.on('resizestart', () => {
          originalBBoxRef.current = group.rbox(importedSVG);
        });

        group.on('resizing', (e) => {
          if (!originalBBoxRef.current) return;
          const { box } = e.detail.handler;
          const scaleX = box.width / originalBBoxRef.current.width;
          const scaleY = box.height / originalBBoxRef.current.height;
          // uniform scaling or freeform scaling:
          const scale = Math.min(scaleX, scaleY);
          group.transform({ scale, origin: 'top-left' });
        });

        group.on('resized', () => {
          originalBBoxRef.current = null;
        });

        highlightRect.hide();
      };

      // Make groups draggable and clickable
      interactiveGroups.forEach((g) => {
        g.draggable();

        g.on('click', (event) => {
          event.stopPropagation();
          handleSelect(g);
        });

        // Optional: double-click scaling
        g.on('dblclick', () => {
          const scale = prompt('Enter scale factor (e.g., 1.5):', '1');
          if (scale && !isNaN(parseFloat(scale))) {
            g.scale(parseFloat(scale));
          }
        });
      });

      // Hover logic
      const onMouseMove = (event) => {
        if (selectedGroupRef.current) return;

        const groupEl = event.target.closest('g[data-draggable]');
        if (groupEl) {
          if (hoveredGroupRef.current !== groupEl) {
            hoveredGroupRef.current = groupEl;
            showHighlightBoxForGroup(SVG(groupEl), importedSVG);
          }
        } else {
          hoveredGroupRef.current = null;
          highlightRect.hide();
        }
      };

      const onMouseLeave = () => {
        if (!selectedGroupRef.current) {
          hoveredGroupRef.current = null;
          highlightRect.hide();
        }
      };

      const onContainerClick = (event) => {
        if (!event.target.closest('g[data-draggable]')) {
          deselectAll();
          highlightRect.hide();
          hoveredGroupRef.current = null;
        }
      };

      svgContainerRef.current.addEventListener('mousemove', onMouseMove);
      svgContainerRef.current.addEventListener('mouseleave', onMouseLeave);
      svgContainerRef.current.addEventListener('click', onContainerClick);

      return () => {
        if (svgContainerRef.current) {
          svgContainerRef.current.removeEventListener('mousemove', onMouseMove);
          svgContainerRef.current.removeEventListener('mouseleave', onMouseLeave);
          svgContainerRef.current.removeEventListener('click', onContainerClick);
        }
      };

      function showHighlightBoxForGroup(g, root) {
        if (!highlightRectRef.current || !g) return;
        const rbox = g.rbox(root);
        highlightRectRef.current
          .size(rbox.width, rbox.height)
          .move(rbox.x, rbox.y)
          .show();
      }

    } catch (error) {
      console.error('Error initializing SVG:', error);
    }
  }, []);

  // Similar logic to the second code snippet: wrap shapes in groups with invisible rect
  function wrapShapesWithClickableRect(svgRoot) {
    const shapes = svgRoot.find('circle, ellipse, rect, polygon, path, text');
    shapes.forEach(shape => {
      // If already wrapped
      if (shape.parent().type === 'g' && shape.parent().attr('data-draggable')) {
        return;
      }

      const bbox = shape.bbox();
      const g = svgRoot.group().attr('data-draggable', 'true');
      // Move the shape into the group
      shape.before(g);
      g.add(shape);

      // Add invisible rect behind the shape as bounding box
      const invisibleRect = g.rect(bbox.width, bbox.height)
        .fill('transparent')
        .move(bbox.x, bbox.y)
        .attr('pointer-events', 'fill');

      // The shape might have its own transforms; to keep it stable,
      // let's apply no transform changes for now.
      // If needed, you could normalize transforms here.
    });
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-1000 to-black flex flex-col items-center overflow-y-auto text-white relative h-full">
      <Navbar />
      <div
        ref={svgContainerRef}
        className="w-full h-4/5 border bg-black rounded-lg shadow-lg"
      ></div>
    </div>
  );
};

export default EditorPage;
