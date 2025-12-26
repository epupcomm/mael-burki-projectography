import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  Search, 
  ExternalLink, 
  Info,
  X,
  ChevronUp,
  ChevronDown,
  Calendar,
  FileText,
  Layers,
  User,
  Tag,
  GripVertical,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Eye,
  Link as LinkIcon,
  Heart
} from 'lucide-react';
import { PROJECTS, MEDIUM_METADATA } from './data';
import { Project } from './types';

type SortConfig = {
  key: keyof Project;
  direction: 'asc' | 'desc';
} | null;

type FocusPane = 'BOTH' | 'PROJECT' | 'MEDIUM';

const parseDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day).getTime();
};

const cleanLinkLabel = (label: string) => {
  return label.replace(/^(learn more about |learn more: |you might love: |you might love )/i, '');
};

const App: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
  const [focusPane, setFocusPane] = useState<FocusPane>('BOTH');
  const [showInfo, setShowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMedium, setFilterMedium] = useState<string>('ALL MEDIUM');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'startDate', direction: 'desc' });

  const [detailWidthPct, setDetailWidthPct] = useState(0); 
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const finalDetailWidthPct = useMemo(() => {
    if (detailWidthPct < 15) return 0;
    if (detailWidthPct > 85) return 100;
    return detailWidthPct;
  }, [detailWidthPct]);

  const selectedProject = useMemo(() => 
    PROJECTS.find(p => p.id === selectedProjectId) || null,
    [selectedProjectId]
  );

  const mediumInfo = useMemo(() => 
    selectedMedium ? MEDIUM_METADATA[selectedMedium] : null,
    [selectedMedium]
  );

  const projectsWithMedium = useMemo(() => 
    selectedMedium ? PROJECTS.filter(p => p.medium === selectedMedium) : [],
    [selectedMedium]
  );

  const handleSort = (key: keyof Project) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let results = PROJECTS.filter(p => {
      const searchContent = [
        p.title, p.secondTitle, p.client, p.description, 
        p.thema, p.medium, p.context, p.goal, p.impactAnalysis, p.learnings
      ].join(' ').toLowerCase();
      
      const matchesSearch = q === '' || searchContent.includes(q);
      const matchesMedium = filterMedium === 'ALL MEDIUM' || p.medium === filterMedium;
      return matchesSearch && matchesMedium;
    });

    if (sortConfig) {
      results.sort((a, b) => {
        let aVal: any = a[sortConfig.key] || '';
        let bVal: any = b[sortConfig.key] || '';

        if (sortConfig.key === 'startDate') {
          aVal = parseDate(aVal);
          bVal = parseDate(bVal);
        } else {
          aVal = aVal.toString().toLowerCase();
          bVal = bVal.toString().toLowerCase();
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return results;
  }, [searchQuery, filterMedium, sortConfig]);

  const handleRowClick = (id: string) => {
    setSelectedProjectId(id);
    setSelectedMedium(null); 
    setFocusPane('BOTH');
    setDetailWidthPct(50);
  };

  const handleMediumClick = (medium: string) => {
    setSelectedMedium(medium);
    setFocusPane('BOTH');
    setDetailWidthPct(100);
  };

  const resetView = () => {
    setDetailWidthPct(0);
    setSelectedProjectId(null);
    setSelectedMedium(null);
    setFocusPane('BOTH');
  };

  const mediums = ['ALL MEDIUM', ...Array.from(new Set(PROJECTS.map(p => p.medium)))];

  const SortIndicator = ({ columnKey }: { columnKey: keyof Project }) => {
    if (sortConfig?.key !== columnKey) return <div className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-30 transition-opacity"><ChevronUp className="w-full h-full" /></div>;
    return (
      <div className="w-3 h-3 ml-2 text-brand">
        {sortConfig.direction === 'asc' ? <ChevronUp className="w-full h-full" /> : <ChevronDown className="w-full h-full" />}
      </div>
    );
  };

  const startResizing = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      const containerWidth = containerRect.width;
      let newDetailPct = 100 - (relativeX / containerWidth) * 100;
      newDetailPct = Math.max(0, Math.min(100, newDetailPct));
      setDetailWidthPct(newDetailPct);
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const tableWidthPct = 100 - finalDetailWidthPct;
  const isTableOnly = finalDetailWidthPct === 0;
  
  const showDateColumn = tableWidthPct > 20;
  const showClientColumn = tableWidthPct > 40;
  const showMediumColumn = tableWidthPct > 50;
  const showTopicColumn = tableWidthPct > 60;
  const showAudienceColumn = tableWidthPct > 80;

  const isDualMode = !!(selectedProjectId && selectedMedium);

  const statusMessage = useMemo(() => {
    if (isTableOnly) return "ALL";
    if (isDualMode) return `${selectedProject?.title} / ${selectedMedium}`;
    if (selectedMedium) return `MEDIUM: ${selectedMedium}`;
    return selectedProject ? selectedProject.title : "NONE";
  }, [isTableOnly, selectedProject, selectedMedium, selectedProjectId, isDualMode]);

  const getScaleClass = (pct: number) => {
    if (pct > 70) return 'text-xl lg:text-2xl xl:text-3xl';
    if (pct > 40) return 'text-lg lg:text-xl';
    return 'text-sm lg:text-base';
  };

  const getTitleScale = (pct: number) => {
    if (pct > 70) return 'text-9xl lg:text-[13rem] xl:text-[16rem]';
    if (pct > 40) return 'text-7xl lg:text-9xl';
    return 'text-5xl lg:text-7xl';
  };

  return (
    <div className={`flex flex-col h-screen bg-black text-white selection:bg-brand selection:text-white ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      {/* Header */}
      <header className="h-12 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={resetView}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <span className="text-xl font-serif-modern italic font-medium uppercase tracking-[0.05em] [word-spacing:0.15em]">PROJECTOGRAPHY</span>
        </button>
        <div className="flex items-center gap-3 relative">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className={`p-1.5 rounded transition-all ${showInfo ? 'bg-brand text-black' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <Info className="w-4 h-4" />
          </button>
          
          {showInfo && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-brand/40 p-4 rounded-sm shadow-2xl z-[100] halftone-bg backdrop-blur-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono-grid text-brand uppercase tracking-widest font-bold">System_Note</span>
                <button onClick={() => setShowInfo(false)} className="text-zinc-500 hover:text-white"><X className="w-3 h-3" /></button>
              </div>
              <p className="text-xs leading-relaxed text-zinc-300 font-medium">
                👋 Manage each view individually with its own Close and Maximize controls. Access external links and project credits in the detail pane.
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Control Bar */}
      <div className="h-10 border-b border-zinc-800 flex items-center bg-zinc-900/30 overflow-hidden shrink-0">
        <div className="flex-1 h-full px-4 flex items-center text-xs font-mono-grid truncate uppercase">
          <span className="text-brand mr-2 font-bold">PATH:</span>
          <span className="text-zinc-400">{statusMessage}</span>
        </div>
        
        <div className="flex items-center h-full border-l border-zinc-800 shrink-0">
          <div className="relative group border-r border-zinc-800 h-full flex items-center px-3">
            <Search className="w-3 h-3 text-zinc-500 group-focus-within:text-brand mr-2" />
            <input 
              type="text" 
              placeholder="SEARCH"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[10px] font-mono-grid text-zinc-300 focus:outline-none placeholder:text-zinc-600 w-48 uppercase tracking-widest"
            />
          </div>

          <div className="px-4 h-full flex items-center shrink-0">
            <select 
              className="bg-transparent text-[10px] font-mono-grid text-zinc-400 focus:outline-none cursor-pointer uppercase tracking-widest"
              value={filterMedium}
              onChange={(e) => setFilterMedium(e.target.value)}
            >
              {mediums.map(m => <option key={m} value={m} className="bg-zinc-900">{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      <main ref={containerRef} className="flex-1 flex overflow-hidden relative bg-black">
        {/* Table View */}
        <div 
          className={`flex flex-col border-r border-zinc-800 bg-black transition-[width,opacity] duration-300 ease-out overflow-hidden ${tableWidthPct === 0 ? 'pointer-events-none' : ''}`}
          style={{ width: `${tableWidthPct}%`, opacity: tableWidthPct < 5 ? 0 : 1 }}
        >
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse table-auto">
              <thead className="sticky top-0 z-20 bg-zinc-900/95 backdrop-blur-sm">
                <tr className="text-[10px] font-mono-grid text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                  {showDateColumn && (
                    <th onClick={() => handleSort('startDate')} className="px-5 h-10 border-r border-zinc-800 font-normal text-left cursor-pointer hover:bg-zinc-800 transition-colors group">
                      <div className="flex items-center"><Calendar className="w-3 h-3" /><span className="ml-4">Date</span> <SortIndicator columnKey="startDate" /></div>
                    </th>
                  )}
                  <th onClick={() => handleSort('title')} className="px-5 h-10 border-r border-zinc-800 font-normal text-left cursor-pointer hover:bg-zinc-800 transition-colors group min-w-[150px]">
                    <div className="flex items-center"><FileText className="w-3 h-3" /><span className="ml-4">Project</span> <SortIndicator columnKey="title" /></div>
                  </th>
                  {showTopicColumn && (
                    <th onClick={() => handleSort('thema')} className="px-5 h-10 border-r border-zinc-800 font-normal text-left cursor-pointer hover:bg-zinc-800 transition-colors group whitespace-nowrap">
                      <div className="flex items-center"><Tag className="w-3 h-3" /><span className="ml-4">Topic</span> <SortIndicator columnKey="thema" /></div>
                    </th>
                  )}
                  {showMediumColumn && (
                    <th onClick={() => handleSort('medium')} className="px-5 h-10 border-r border-zinc-800 font-normal text-center cursor-pointer hover:bg-zinc-800 transition-colors group">
                      <div className="flex items-center justify-center"><Layers className="w-3 h-3" /><span className="ml-4">Medium</span> <SortIndicator columnKey="medium" /></div>
                    </th>
                  )}
                  {showClientColumn && (
                    <th onClick={() => handleSort('client')} className="px-5 h-10 border-r border-zinc-800 font-normal text-left cursor-pointer hover:bg-zinc-800 transition-colors group">
                      <div className="flex items-center"><User className="w-3 h-3" /><span className="ml-4">Client</span> <SortIndicator columnKey="client" /></div>
                    </th>
                  )}
                  {showAudienceColumn && (
                    <th onClick={() => handleSort('totalAudience')} className="px-5 h-10 font-normal text-left cursor-pointer hover:bg-zinc-800 transition-colors group">
                      <div className="flex items-center"><Eye className="w-3 h-3" /><span className="ml-4">Reach</span> <SortIndicator columnKey="totalAudience" /></div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {sortedAndFilteredProjects.map((project) => (
                  <tr 
                    key={project.id}
                    onClick={() => handleRowClick(project.id)}
                    className={`hover:bg-brand/5 cursor-pointer transition-colors group ${(selectedProjectId === project.id) ? 'bg-brand/10' : ''}`}
                  >
                    {showDateColumn && (
                      <td className="px-5 py-4 border-r border-zinc-800/50 text-[10px] font-mono-grid text-zinc-500">{project.startDate}</td>
                    )}
                    <td className="px-5 py-4 border-r border-zinc-800/50">
                      <div className={`font-medium leading-tight mb-1 transition-all ${getScaleClass(tableWidthPct)} ${(selectedProjectId === project.id) ? 'text-brand' : 'text-zinc-100'}`}>
                        {project.title}
                      </div>
                      {!showTopicColumn && (
                        <div className="text-[9px] font-mono-grid text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 opacity-40" /> {project.thema}
                        </div>
                      )}
                    </td>
                    {showTopicColumn && (
                      <td className="px-5 py-4 border-r border-zinc-800/50 text-[10px] text-zinc-500 font-mono-grid uppercase tracking-widest">{project.thema}</td>
                    )}
                    {showMediumColumn && (
                      <td className="px-5 py-4 border-r border-zinc-800/50 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] border inline-block leading-tight ${(selectedProjectId === project.id) ? 'bg-brand/20 text-brand border-brand/30' : 'bg-zinc-800/50 text-zinc-400 border-zinc-700'}`}>
                          {project.medium}
                        </span>
                      </td>
                    )}
                    {showClientColumn && (
                      <td className="px-5 py-4 border-r border-zinc-800/50 text-[10px] text-zinc-500 font-medium">{project.client}</td>
                    )}
                    {showAudienceColumn && (
                      <td className="px-5 py-4 text-[10px] text-zinc-500 font-mono-grid font-bold">{project.totalAudience}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resizer */}
        {tableWidthPct > 0 && finalDetailWidthPct > 0 && (
          <div 
            onMouseDown={startResizing}
            className={`w-1 h-full cursor-col-resize hover:bg-brand/50 bg-zinc-800/50 flex items-center justify-center group relative z-40 ${isResizing ? 'bg-brand' : ''}`}
          >
            <GripVertical className="w-4 h-4 text-brand opacity-0 group-hover:opacity-100" />
          </div>
        )}

        {/* Detail Area */}
        <aside 
          className={`bg-zinc-950 flex relative overflow-hidden transition-[width,opacity] duration-300 ease-out border-l border-zinc-800 shrink-0 z-30 ${finalDetailWidthPct === 0 ? 'pointer-events-none' : ''}`}
          style={{ width: `${finalDetailWidthPct}%`, opacity: finalDetailWidthPct < 5 ? 0 : 1 }}
        >
          {/* PROJECT DETAIL PANE */}
          {selectedProject && (
            <div 
              className={`flex flex-col overflow-hidden border-r border-zinc-800/50 transition-all duration-500 ease-in-out relative
                ${isDualMode ? (focusPane === 'PROJECT' ? 'w-full absolute inset-0 z-20' : (focusPane === 'MEDIUM' ? 'w-0 opacity-0 pointer-events-none' : 'w-1/2')) : 'w-full'}
              `}
            >
              {/* Project Pane Controls */}
              <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                {isDualMode && (
                  <button 
                    onClick={() => setFocusPane(focusPane === 'PROJECT' ? 'BOTH' : 'PROJECT')} 
                    className="p-1.5 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-sm hover:bg-brand hover:text-black transition-colors shadow-lg"
                    title={focusPane === 'PROJECT' ? "Restore Split View" : "Maximize Project"}
                  >
                    {focusPane === 'PROJECT' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                )}
                {!isDualMode && (
                  <button 
                    onClick={() => setDetailWidthPct(finalDetailWidthPct > 90 ? 50 : 100)} 
                    className="p-1.5 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-sm hover:bg-brand hover:text-black transition-colors shadow-lg"
                  >
                    {finalDetailWidthPct > 90 ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (isDualMode) {
                      setSelectedProjectId(null);
                      setFocusPane('BOTH');
                    } else {
                      resetView();
                    }
                  }} 
                  className="p-1.5 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-sm hover:bg-brand hover:text-black transition-colors shadow-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className={`w-full grain-fade-container shrink-0 transition-all duration-500 flex flex-col justify-end min-h-[22rem]`}>
                  {selectedProject.thumbnail && (
                    <img src={selectedProject.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 transition-all duration-1000" />
                  )}
                  <div className="grain-fade-overlay"></div>
                  
                  <div className="relative w-full flex flex-col gap-y-2.5 p-8 pb-8">
                    <div className="flex">
                      <button 
                        onClick={() => handleMediumClick(selectedProject.medium)}
                        className={`shrink-0 text-[10px] lg:text-xs font-mono-grid tracking-[0.25em] uppercase px-4 py-1.5 border rounded-full bg-brand/10 backdrop-blur-sm whitespace-nowrap transition-all cursor-pointer group ${selectedMedium === selectedProject.medium ? 'bg-brand text-black border-brand' : 'text-brand border-brand/30 hover:bg-brand hover:text-black'}`}
                      >
                        {selectedProject.medium}
                      </button>
                    </div>
                    
                    <div className="w-full">
                      <h1 className={`font-serif-modern italic leading-[0.85] text-brand break-words transition-all duration-300 ${isDualMode && focusPane === 'BOTH' ? 'text-5xl lg:text-7xl' : getTitleScale(finalDetailWidthPct)}`}>
                        {selectedProject.title}
                      </h1>
                    </div>

                    <div className="w-full">
                      <p className={`text-zinc-200 font-light tracking-wide italic leading-[1.05] break-words opacity-70 transition-all duration-300 ${isDualMode && focusPane === 'BOTH' ? 'text-sm lg:text-base' : getScaleClass(finalDetailWidthPct)}`}>
                        {selectedProject.secondTitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 sm:p-10 pt-10 mx-auto w-full">
                  {/* PROJECT INFO GRID - Rearranged as requested */}
                  <div className="grid grid-cols-2 gap-x-12 gap-y-12 mb-10 border-b border-zinc-800 pb-12">
                    {/* Pair 1: Topic & Client */}
                    <div>
                      <h4 className="text-[9px] font-mono-grid text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Tag className="w-2.5 h-2.5" /> Topic</h4>
                      <p className="font-bold text-white break-words uppercase tracking-tighter text-base">{selectedProject.thema}</p>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-mono-grid text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5"><User className="w-2.5 h-2.5" /> Client</h4>
                      <p className="font-bold text-white break-words text-base">{selectedProject.client}</p>
                    </div>

                    {/* Pair 2: Duration & Reach (Swapped positions) */}
                    <div>
                      <h4 className="text-[9px] font-mono-grid text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Calendar className="w-2.5 h-2.5" /> Duration</h4>
                      <p className="font-mono-grid text-white text-[12px] leading-tight font-bold">
                        {selectedProject.startDate} <span className="text-brand">→</span><br/>{selectedProject.endDate}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-mono-grid text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Eye className="w-2.5 h-2.5" /> Reach</h4>
                      <p className="font-bold text-white break-words text-base font-mono-grid">{selectedProject.totalAudience}</p>
                    </div>
                  </div>

                  <div className="mb-10">
                    <h4 className="text-[9px] font-mono-grid text-white/40 uppercase tracking-widest mb-3">Caption</h4>
                    <p className="leading-relaxed text-zinc-100 font-light text-sm">{selectedProject.description}</p>
                  </div>

                  <div className="mb-12">
                    <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-brand transition-all w-full justify-center text-center shadow-lg">
                      <ExternalLink className="w-4 h-4" /> View Content
                    </a>
                  </div>

                  <div className="space-y-12">
                    <section>
                      <h4 className="text-[9px] font-mono-grid text-white/30 uppercase tracking-widest mb-2">Context</h4>
                      <p className="leading-relaxed text-zinc-400 font-light text-sm">{selectedProject.context}</p>
                    </section>
                    <section>
                      <h4 className="text-[9px] font-mono-grid text-white/30 uppercase tracking-widest mb-2">Outcome</h4>
                      <p className="leading-relaxed text-zinc-400 font-light text-sm">{selectedProject.impactAnalysis}</p>
                    </section>
                  </div>

                  {/* PROJECT CREDITS TABLE */}
                  <div className="mt-14 pt-8 border-t border-zinc-800/60 mb-10">
                    <h4 className="text-[9px] font-mono-grid text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">Credits</h4>
                    <div className="overflow-hidden border border-zinc-800/50 bg-zinc-900/10">
                      <table className="w-full text-xs font-mono-grid">
                        <thead>
                          <tr className="border-b border-zinc-800 text-[8px] text-white/20 text-left uppercase">
                            <th className="px-4 py-3 border-r border-zinc-800 font-normal">Role</th>
                            <th className="px-4 py-3 font-normal">Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProject.credits.map((credit, i) => (
                            <tr key={i} className="border-b border-zinc-800/20 last:border-0 hover:bg-brand/5">
                              <td className="px-4 py-3 border-r border-zinc-800/20 text-white/30 uppercase text-[9px]">{credit.role}</td>
                              <td className="px-4 py-3 text-white/70">{credit.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* RELATED LINKS SECTION */}
                  {selectedProject.relatedLinks && selectedProject.relatedLinks.length > 0 && (
                    <div className="mt-14 pt-8 border-t border-zinc-800/60 mb-10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        <div>
                          <h4 className="text-[9px] font-mono-grid text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <LinkIcon className="w-3 h-3 text-zinc-600" /> Learn More
                          </h4>
                          <div className="space-y-3">
                            {selectedProject.relatedLinks.filter(l => l.label.toLowerCase().includes('learn')).map((link, i) => (
                              <a 
                                key={i} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between p-3 border border-zinc-800 hover:border-brand/50 bg-zinc-900/20 transition-all rounded-sm"
                              >
                                <span className="text-[10px] font-mono-grid text-zinc-400 group-hover:text-white uppercase truncate mr-4">
                                  {cleanLinkLabel(link.label)}
                                </span>
                                <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-brand" />
                              </a>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[9px] font-mono-grid text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Heart className="w-3 h-3 text-zinc-600" /> You Might Love
                          </h4>
                          <div className="space-y-3">
                            {selectedProject.relatedLinks.filter(l => !l.label.toLowerCase().includes('learn')).map((link, i) => (
                              <a 
                                key={i} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between p-3 border border-zinc-800 hover:border-brand/50 bg-zinc-900/20 transition-all rounded-sm"
                              >
                                <span className="text-[10px] font-mono-grid text-zinc-400 group-hover:text-white uppercase truncate mr-4">
                                  {cleanLinkLabel(link.label)}
                                </span>
                                <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-brand" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MEDIUM DETAIL PANE */}
          {selectedMedium && (
            <div 
              className={`flex flex-col overflow-hidden halftone-bg transition-all duration-500 ease-in-out relative
                ${isDualMode ? (focusPane === 'MEDIUM' ? 'w-full absolute inset-0 z-20' : (focusPane === 'PROJECT' ? 'w-0 opacity-0 pointer-events-none' : 'w-1/2')) : (selectedProject ? 'w-0' : 'w-full')}
              `}
            >
              {/* Medium Pane Controls */}
              <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                {isDualMode && (
                  <button 
                    onClick={() => setFocusPane(focusPane === 'MEDIUM' ? 'BOTH' : 'MEDIUM')} 
                    className="p-1.5 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-sm hover:bg-brand hover:text-black transition-colors shadow-lg"
                    title={focusPane === 'MEDIUM' ? "Restore Split View" : "Maximize Medium"}
                  >
                    {focusPane === 'MEDIUM' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                )}
                {!isDualMode && (
                  <button 
                    onClick={() => setDetailWidthPct(finalDetailWidthPct > 90 ? 50 : 100)} 
                    className="p-1.5 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-sm hover:bg-brand hover:text-black transition-colors shadow-lg"
                  >
                    {finalDetailWidthPct > 90 ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (isDualMode) {
                      setSelectedMedium(null);
                      setFocusPane('BOTH');
                      setDetailWidthPct(50); 
                    } else {
                      resetView();
                    }
                  }} 
                  className="p-1.5 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-sm hover:bg-brand hover:text-black transition-colors shadow-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className={`p-8 sm:p-12 pt-16 mx-auto w-full ${isDualMode && focusPane === 'BOTH' ? '' : 'max-w-5xl'}`}>
                  <h1 className={`font-serif-modern italic leading-[0.85] text-brand break-words transition-all duration-300 mb-6 ${isDualMode && focusPane === 'BOTH' ? 'text-5xl lg:text-7xl' : getTitleScale(finalDetailWidthPct)}`}>
                    {mediumInfo?.title}
                  </h1>

                  <div className="grid grid-cols-1 gap-12 mb-16">
                    <div>
                      <h4 className="text-[9px] font-mono-grid text-white/40 uppercase tracking-widest mb-4">Approach</h4>
                      <p className="leading-relaxed text-zinc-100 font-light text-sm">
                        {mediumInfo?.approach}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-10">
                    <h4 className="text-[9px] font-mono-grid text-white/40 uppercase tracking-widest mb-6">Related Projects ({projectsWithMedium.length})</h4>
                    <div className="overflow-hidden border border-zinc-800 bg-black shadow-2xl">
                      <table className="w-full text-xs font-mono-grid">
                        <thead>
                          <tr className="border-b border-zinc-800 text-[8px] text-white/20 text-left uppercase">
                            <th className="px-4 py-3 border-r border-zinc-800 font-normal">Project</th>
                            <th className="px-4 py-3 font-normal">Topic</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectsWithMedium.map((p) => (
                            <tr 
                              key={p.id} 
                              onClick={() => setSelectedProjectId(p.id)}
                              className={`border-b border-zinc-800 last:border-0 hover:bg-brand/10 cursor-pointer transition-colors ${selectedProjectId === p.id ? 'bg-brand/10 text-brand' : ''}`}
                            >
                              <td className="px-4 py-3 border-r border-zinc-800 font-medium">{p.title}</td>
                              <td className="px-4 py-3 text-zinc-500">{p.thema}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* Footer */}
      <footer className="h-6 border-t border-zinc-800 bg-brand text-black flex items-center px-4 justify-between text-[10px] font-mono-grid font-bold shrink-0">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div> 
            VAULT_READY
          </span>
          <span className="hidden sm:inline">ENTRIES: {sortedAndFilteredProjects.length}</span>
        </div>
        <div className="flex gap-4 items-center uppercase tracking-tighter">
          {finalDetailWidthPct === 100 ? (isDualMode ? `DUAL_${focusPane}` : "SOLO_VIEW") : finalDetailWidthPct > 0 ? "EXPLORATION" : "INDEX"}
        </div>
      </footer>
    </div>
  );
};

export default App;