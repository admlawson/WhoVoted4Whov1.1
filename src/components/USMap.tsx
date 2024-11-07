import React, { useEffect, useRef, useState } from 'react';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Election } from '../types/election';
import { US_STATES } from '../config/states';
import { Info, Map } from 'lucide-react';

interface USMapProps {
  election: Election;
  onStateClick: (state: string) => void;
  selectedState: string;
  highlightOnly?: boolean;
}

export function USMap({ election, onStateClick, selectedState, highlightOnly }: USMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Define swing state threshold (5% margin or less)
  const isSwingState = (stateData: typeof election.stateResults[keyof typeof election.stateResults]) => {
    const totalVotes = stateData.popularVotes.democratic + stateData.popularVotes.republican;
    const margin = Math.abs(
      stateData.popularVotes.democratic - stateData.popularVotes.republican
    ) / totalVotes * 100;
    return margin <= 5;
  };

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json');
        const topology = await response.json();
        const geojson = feature(topology, topology.objects.states);
        
        if (!svgRef.current) return;

        // Create pattern definitions for swing states
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Democratic swing state pattern
        const demPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        demPattern.setAttribute('id', 'dem-swing');
        demPattern.setAttribute('patternUnits', 'userSpaceOnUse');
        demPattern.setAttribute('width', '8');
        demPattern.setAttribute('height', '8');
        demPattern.setAttribute('patternTransform', 'rotate(45)');
        const demLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        demLine.setAttribute('x1', '0');
        demLine.setAttribute('y1', '0');
        demLine.setAttribute('x2', '0');
        demLine.setAttribute('y2', '8');
        demLine.setAttribute('stroke', 'rgba(59, 130, 246, 0.8)');
        demLine.setAttribute('stroke-width', '4');
        demPattern.appendChild(demLine);
        defs.appendChild(demPattern);

        // Republican swing state pattern
        const repPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        repPattern.setAttribute('id', 'rep-swing');
        repPattern.setAttribute('patternUnits', 'userSpaceOnUse');
        repPattern.setAttribute('width', '8');
        repPattern.setAttribute('height', '8');
        repPattern.setAttribute('patternTransform', 'rotate(45)');
        const repLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        repLine.setAttribute('x1', '0');
        repLine.setAttribute('y1', '0');
        repLine.setAttribute('x2', '0');
        repLine.setAttribute('y2', '8');
        repLine.setAttribute('stroke', 'rgba(239, 68, 68, 0.8)');
        repLine.setAttribute('stroke-width', '4');
        repPattern.appendChild(repLine);
        defs.appendChild(repPattern);

        svgRef.current.appendChild(defs);

        const width = 960;
        const height = 600;
        const projection = geoAlbersUsa().fitSize([width, height], geojson);
        const path = geoPath().projection(projection);

        // Clear existing paths
        while (svgRef.current.firstChild) {
          svgRef.current.removeChild(svgRef.current.firstChild);
        }
        svgRef.current.appendChild(defs);

        // Create state groups
        geojson.features.forEach(feature => {
          const stateCode = Object.keys(US_STATES).find(
            code => US_STATES[code].toLowerCase() === feature.properties.name.toLowerCase()
          );
          
          if (!stateCode) return;

          const stateData = election.stateResults[stateCode];
          if (!stateData) return;

          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.setAttribute('class', 'state-group');

          // Create path for state shape
          const statePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const pathD = geoPath().projection(projection)(feature) || '';
          statePath.setAttribute('d', pathD);
          
          // Calculate color intensity based on margin
          const margin = Math.abs(
            stateData.popularVotes.democratic - stateData.popularVotes.republican
          ) / (stateData.popularVotes.democratic + stateData.popularVotes.republican);
          
          const isSwing = isSwingState(stateData);
          const isDemWin = stateData.winnerParty === 'Democratic';
          
          if (isSwing) {
            statePath.setAttribute('fill', `url(#${isDemWin ? 'dem-swing' : 'rep-swing'})`);
          } else {
            const intensity = Math.min(0.9, 0.4 + margin * 2);
            const baseColor = isDemWin ? [59, 130, 246] : [239, 68, 68];
            const color = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${intensity})`;
            statePath.setAttribute('fill', color);
          }
          
          statePath.setAttribute('stroke', '#fff');
          statePath.setAttribute('stroke-width', stateCode === selectedState ? '2' : '1');
          statePath.setAttribute('class', 
            `state-path transition-all duration-200 cursor-pointer 
             hover:brightness-110 hover:stroke-2 active:brightness-90`
          );

          // Add electoral vote count label
          const centroid = path.centroid(feature);
          if (centroid.length === 2) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', centroid[0].toString());
            text.setAttribute('y', centroid[1].toString());
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('class', 
              'text-[10px] font-semibold fill-white stroke-gray-800 stroke-[0.5px] pointer-events-none'
            );
            text.textContent = stateData.electoralVotes.toString();
            group.appendChild(text);
          }

          // Event handlers
          const handleMouseMove = (e: MouseEvent) => {
            const rect = svgRef.current?.getBoundingClientRect();
            if (rect) {
              setTooltipPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              });
            }
          };

          statePath.addEventListener('mouseenter', () => {
            setHoveredState(stateCode);
            setShowTooltip(true);
          });
          statePath.addEventListener('mouseleave', () => {
            setHoveredState(null);
            setShowTooltip(false);
          });
          statePath.addEventListener('mousemove', handleMouseMove);
          statePath.addEventListener('click', () => onStateClick(stateCode));

          group.appendChild(statePath);
          svgRef.current?.appendChild(group);
        });
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    fetchMap();
  }, [election, onStateClick, selectedState, highlightOnly]);

  const getTooltipContent = () => {
    if (!hoveredState || !election.stateResults[hoveredState]) return null;
    const stateData = election.stateResults[hoveredState];
    const totalVotes = stateData.popularVotes.democratic + stateData.popularVotes.republican;
    const margin = ((Math.abs(stateData.popularVotes.democratic - stateData.popularVotes.republican) / totalVotes) * 100).toFixed(1);
    const swing = isSwingState(stateData);

    return (
      <div className="bg-white rounded-lg shadow-lg p-3 text-sm w-64">
        <h3 className="font-semibold mb-2">{US_STATES[hoveredState]}</h3>
        <div className="space-y-1">
          <p><span className="font-medium">Electoral Votes:</span> {stateData.electoralVotes}</p>
          <p><span className="font-medium">Winner:</span> {stateData.winner}</p>
          <p><span className="font-medium">Margin:</span> {margin}%</p>
          <p><span className="font-medium">Status:</span> {swing ? 'Swing State' : 'Solid State'}</p>
          <p><span className="font-medium">Turnout:</span> {stateData.turnout.toFixed(1)}%</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">State-by-State Results</h2>
        </div>
        <button
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full 
                     hover:bg-gray-100 transition-colors"
          title="Map shows electoral votes and victory margins. Striped patterns indicate swing states (margin ≤ 5%)."
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="relative aspect-[960/600]">
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 960 600"
          style={{ maxHeight: '600px' }}
        />
        {showTooltip && hoveredState && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full
                       z-10 animate-fade-in"
            style={{ 
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 10}px`
            }}
          >
            {getTooltipContent()}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 mb-2">Party Control</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span className="text-sm text-gray-600">Democratic (Solid)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span className="text-sm text-gray-600">Republican (Solid)</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 bg-stripes rounded"></div>
              <span className="text-sm text-gray-600">Democratic (Swing)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 bg-stripes rounded"></div>
              <span className="text-sm text-gray-600">Republican (Swing)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 mb-2">Victory Margin</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Lighter</span>
            <div className="flex-1 h-2 bg-gradient-to-r from-gray-200 to-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Stronger</span>
          </div>
          <p className="text-sm text-gray-500">
            Darker shades indicate larger victory margins. Striped patterns show swing states with margins of 5% or less.
          </p>
        </div>
      </div>
    </div>
  );
}