import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { usePlannerStore } from '../store/usePlannerStore';
// simple text icons instead of lucide-react


const SidebarCourseItem = ({ course, index }) => {
  const globalExpanded = usePlannerStore((state) => state.isAllExpanded);
  const [isExpanded, setIsExpanded] = React.useState(globalExpanded);

  React.useEffect(() => {
    setIsExpanded(globalExpanded);
  }, [globalExpanded]);
  
  return (
    <Draggable draggableId={course.id} index={index}>
      {(dragProvided, dragSnapshot) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          className={`sidebar-course-card ${dragSnapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="course-card-header">
            <strong>{course.code}</strong>
            <div className="course-card-actions">
              <button 
                className="expand-btn" 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                title="More info"
              >
                {isExpanded ? '▲' : '▼'}
              </button>
            </div>
          </div>
          <div className="course-card-units">{course.units} Units</div>
          
          {isExpanded && (
            <div className="course-card-expanded">
              <div className="course-card-title">{course.title}</div>
              <div className="course-card-offered">
                <strong>Offered:</strong> {course.offered ? course.offered.join(', ') : 'Unknown'}
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

  const filteredCourses = availableCourses.filter(course => 
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Course Catalog</h2>
      </div>
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search courses..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <Droppable droppableId="sidebar" isDropDisabled={true}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="sidebar-course-list"
          >
            {filteredCourses.map((course, index) => (
              <SidebarCourseItem key={course.id} course={course} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default CourseSidebar;
