import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { usePlannerStore, availableDepartments } from '../store/usePlannerStore';
import { Search, ChevronDown, Plus, Minus, Book } from 'lucide-react';

const SidebarCourseItem = ({ course, index }) => {
  const globalExpanded = usePlannerStore((state) => state.isAllExpanded);
  const planner = usePlannerStore((state) => state.planner);
  const [isExpanded, setIsExpanded] = React.useState(globalExpanded);

  // Check if course is already in the planner
  const isPlanned = Object.values(planner).some(quarterList => 
    quarterList.some(c => c.id === course.id)
  );

  React.useEffect(() => {
    setIsExpanded(globalExpanded);
  }, [globalExpanded]);

  return (
    <Draggable draggableId={course.id} index={index} isDragDisabled={isPlanned}>
      {(dragProvided, dragSnapshot) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          className={`sidebar-course-card ${dragSnapshot.isDragging ? 'dragging' : ''} ${isPlanned ? 'planned-course' : ''}`}
        >
          <div className="course-card-header">
            <strong>{course.code}</strong>
            <div className="course-card-actions">
              <button 
                className={`expand-btn ${isExpanded ? 'expanded' : ''}`} 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                title="More info"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
          <div className="course-card-units">{course.units} Units</div>
          
          {isExpanded && (
            <div className="course-card-expanded">
              <div className="course-card-title">{course.title}</div>
              <div className="course-card-offered">
                <strong>Offered:</strong> {course.offered && course.offered.length > 0 ? (
                  <div className="offered-pills">
                    {course.offered.map(q => (
                      <span key={q} className={`offered-pill offered-${q.toLowerCase()}`}>{q}</span>
                    ))}
                  </div>
                ) : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not offered this year</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

const CourseSidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const availableCourses = usePlannerStore((state) => state.availableCourses);
  const isAllExpanded = usePlannerStore((state) => state.isAllExpanded);
  const toggleExpandAll = usePlannerStore((state) => state.toggleExpandAll);
  const selectedDepartment = usePlannerStore((state) => state.selectedDepartment);
  const setDepartment = usePlannerStore((state) => state.setDepartment);

  // Filter first by department, then by search term
  const filteredCourses = availableCourses.filter(course => {
    // If a specific department is selected, filter by it
    if (selectedDepartment !== 'none' && course.department !== selectedDepartment) {
      return false;
    }
    // Then apply search constraint if it exists
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const code = course.code || "";
      const title = course.title || "";
      return code.toLowerCase().includes(lowerSearch) || 
             title.toLowerCase().includes(lowerSearch);
    }
    return true;
  });

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Course Catalog</h2>
      </div>
      
      <div className="major-select-container" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <label htmlFor="dept-select" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select Department:</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem' }}>
          <Book size={16} color="var(--ucla-blue)" />
          <select 
            id="dept-select" 
            value={selectedDepartment} 
            onChange={(e) => setDepartment(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <option value="none">All Departments</option>
            {availableDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="search-container">
        <span className="search-icon"><Search size={18} color="var(--text-secondary)" strokeWidth={2} /></span>
        <input 
          type="text" 
          placeholder="Search courses..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <div style={{ padding: '0.75rem 1rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
        <button 
          className="text-action-btn" 
          onClick={toggleExpandAll}
          style={{ alignSelf: 'flex-start' }}
        >
          {isAllExpanded ? <Minus size={16} /> : <Plus size={16} />}
          <span>{isAllExpanded ? "Collapse All Classes" : "Expand All Classes"}</span>
        </button>
      </div>
      <div className="sidebar-course-list-container" style={{ flex: 1, overflowY: 'auto' }}>
        <Droppable 
          droppableId="sidebar" 
          isDropDisabled={true}
          renderClone={(provided, snapshot, rubric) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="sidebar-course-card dragging"
              style={{ ...provided.draggableProps.style, margin: 0 }}
            >
              <div className="course-card-header">
                <strong>{filteredCourses[rubric.source.index].code}</strong>
              </div>
              <div className="course-card-units">{filteredCourses[rubric.source.index].units} Units</div>
            </div>
          )}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="sidebar-course-list flat-list"
            >
              {filteredCourses.map((course, index) => (
                <SidebarCourseItem key={course.id} course={course} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default CourseSidebar;
