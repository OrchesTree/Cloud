'use client';

import { useEffect, useRef, useState } from 'react';

const SVGCanvas = () => {
  const svgContainerRef = useRef(null);
  const svgRef = useRef(null);
  const highlightRef = useRef(null);

  const [selectedElement, setSelectedElement] = useState(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Stores initial data for dragging
  const offsetRef = useRef({ x: 0, y: 0 });
  const originalTranslateRef = useRef({ x: 0, y: 0 });
  const originalBBoxTopLeftRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const svgData = sessionStorage.getItem('svgData');
    if (svgData) {
      svgRef.current.innerHTML = svgData;
      fitSVGToContainer();

      const mainSVG = svgRef.current.querySelector('svg');
      if (mainSVG) {
        // Enhance shapes to make their entire bounding box clickable
        wrapShapesWithClickableRect(mainSVG);

        // Create highlight rect
        const highlightRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        highlightRect.setAttribute('fill', 'none');
        highlightRect.setAttribute('stroke', 'red');
        highlightRect.setAttribute('stroke-width', '2');
        highlightRect.setAttribute('pointer-events', 'none');
        highlightRect.style.display = 'none';
        mainSVG.appendChild(highlightRect);
        highlightRef.current = highlightRect;

        // Event listeners
        mainSVG.addEventListener('mousemove', handleHover);
        mainSVG.addEventListener('mouseleave', handleMouseLeave);
        mainSVG.addEventListener('click', handleClick);
      }
    }

    window.addEventListener('resize', fitSVGToContainer);
    return () => {
      window.removeEventListener('resize', fitSVGToContainer);
      const mainSVG = svgRef.current?.querySelector('svg');
      if (mainSVG) {
        mainSVG.removeEventListener('mousemove', handleHover);
        mainSVG.removeEventListener('mouseleave', handleMouseLeave);
        mainSVG.removeEventListener('click', handleClick);
      }
    };
  }, []);

  const fitSVGToContainer = () => {
    const container = svgContainerRef.current;
    const svg = svgRef.current.querySelector('svg');
    if (container && svg) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      svg.setAttribute('width', containerWidth);
      svg.setAttribute('height', containerHeight);
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  };

  const wrapShapesWithClickableRect = (svg) => {
    // Find all existing shapes that we want to make fully clickable
    // We'll assume closed shapes: rect, circle, ellipse, polygon, closed paths, etc.
    const draggableShapes = svg.querySelectorAll('circle, ellipse, rect, polygon, path, image, text');
    draggableShapes.forEach(shape => {
      // Create a group to hold shape + invisible rect
      // Only if it's not already wrapped
      if (shape.parentNode && shape.parentNode.tagName.toLowerCase() === 'g' && shape.parentNode.hasAttribute('data-draggable')) {
        // Already wrapped, skip
        return;
      }

      const g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
      g.setAttribute('data-draggable', 'true');

      // Insert g before shape, then move shape into g
      shape.parentNode.insertBefore(g, shape);
      g.appendChild(shape);

      // Compute bounding box and add invisible rect
      const bbox = shape.getBBox();
      const invisibleRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
      invisibleRect.setAttribute('x', bbox.x);
      invisibleRect.setAttribute('y', bbox.y);
      invisibleRect.setAttribute('width', bbox.width);
      invisibleRect.setAttribute('height', bbox.height);
      invisibleRect.setAttribute('fill', 'transparent');
      invisibleRect.setAttribute('pointer-events', 'fill');
      // Place the rect behind the shape
      g.insertBefore(invisibleRect, shape);
    });
  };

  const getMousePosition = (event) => {
    const svg = svgRef.current.querySelector('svg');
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  };

  const handleHover = (e) => {
    if (selectedElement || isDragging) return;

    const mainSVG = svgRef.current.querySelector('svg');
    if (!mainSVG) return;

    const draggableGroup = e.target.closest('[data-draggable]');
    if (draggableGroup && draggableGroup.tagName !== 'svg') {
      setHoveredElement(draggableGroup);
      svgContainerRef.current.style.cursor = 'pointer';
      updateHighlightBox(draggableGroup);
    } else {
      clearHover();
    }
  };

  const handleMouseLeave = () => {
    if (!selectedElement && !isDragging) {
      clearHover();
    }
  };

  const handleClick = (e) => {
    const mainSVG = svgRef.current.querySelector('svg');
    const target = e.target.closest('[data-draggable]');
    if (target && target.tagName !== 'svg') {
      // Select this element
      setSelectedElement(target);
      updateHighlightBox(target);
      svgContainerRef.current.style.cursor = 'pointer';
    } else {
      // Clicked empty space, deselect
      setSelectedElement(null);
      clearHover();
      svgContainerRef.current.style.cursor = 'default';
    }
  };

  const clearHover = () => {
    if (!selectedElement) {
      setHoveredElement(null);
      hideHighlightBox();
      svgContainerRef.current.style.cursor = 'default';
    }
  };

  const startDrag = (event) => {
    if (!selectedElement) return;

    const svg = svgRef.current.querySelector('svg');
    const mousePos = getMousePosition(event);

    // Consolidate current transform
    const transform = selectedElement.transform.baseVal.consolidate();
    const initialTransform = transform ? transform.matrix : svg.createSVGMatrix();
    originalTranslateRef.current = { x: initialTransform.e, y: initialTransform.f };

    // Compute bounding box of the selected element group
    const rect = selectedElement.getBoundingClientRect();
    const topLeftSVG = screenToSVGCoords(svg, rect.x, rect.y);
    originalBBoxTopLeftRef.current = topLeftSVG;

    // offset so the shape moves precisely with the mouse
    offsetRef.current = {
      x: mousePos.x - topLeftSVG.x,
      y: mousePos.y - topLeftSVG.y
    };

    setIsDragging(true);
    svgContainerRef.current.style.cursor = 'move';
  };

  const drag = (event) => {
    if (!isDragging || !selectedElement) return;

    const svg = svgRef.current.querySelector('svg');
    const mousePos = getMousePosition(event);

    // Desired new top-left
    const newTopLeft = {
      x: mousePos.x - offsetRef.current.x,
      y: mousePos.y - offsetRef.current.y
    };

    // Calculate delta from original top-left
    const dx = newTopLeft.x - originalBBoxTopLeftRef.current.x;
    const dy = newTopLeft.y - originalBBoxTopLeftRef.current.y;

    // Apply translation relative to original translation
    const newX = originalTranslateRef.current.x + dx;
    const newY = originalTranslateRef.current.y + dy;

    const newTransform = svg.createSVGTransform();
    newTransform.setTranslate(newX, newY);

    const transformList = selectedElement.transform.baseVal;
    if (transformList.numberOfItems > 0) {
      transformList.replaceItem(newTransform, 0);
    } else {
      transformList.appendItem(newTransform);
    }

    // Update highlight
    updateHighlightBox(selectedElement);
  };

  const endDrag = () => {
    if (isDragging) {
      setIsDragging(false);
      svgContainerRef.current.style.cursor = selectedElement ? 'pointer' : 'default';
    }
  };

  const updateHighlightBox = (element) => {
    const highlightRect = highlightRef.current;
    const svg = svgRef.current.querySelector('svg');
    if (!svg || !highlightRect || !element) return;

    const rect = element.getBoundingClientRect();
    const tl = screenToSVGCoords(svg, rect.x, rect.y);
    const br = screenToSVGCoords(svg, rect.x + rect.width, rect.y + rect.height);

    highlightRect.setAttribute('x', tl.x);
    highlightRect.setAttribute('y', tl.y);
    highlightRect.setAttribute('width', br.x - tl.x);
    highlightRect.setAttribute('height', br.y - tl.y);
    highlightRect.style.display = 'block';
  };

  const hideHighlightBox = () => {
    const highlightRect = highlightRef.current;
    if (highlightRect) {
      highlightRect.style.display = 'none';
    }
  };

  const screenToSVGCoords = (svg, screenX, screenY) => {
    const pt = svg.createSVGPoint();
    pt.x = screenX;
    pt.y = screenY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-1000 to-black flex flex-col items-center overflow-y-auto text-white relative">
      <div
        ref={svgContainerRef}
        className="border border-gray-300 w-full h-[700px] bg-white relative overflow-hidden"
        onMouseDown={startDrag}
        onMouseMove={drag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        style={{ cursor: 'default', userSelect: 'none' }}
      >
        <div ref={svgRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default SVGCanvas;
