import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { usePlannerStore } from './store/usePlannerStore';
import CourseSidebar from './components/CourseSidebar';
import PlannerGrid from './components/PlannerGrid';
import './index.css';

function App() {
  const moveCourse = usePlannerStore((state) => state.moveCourse);
  const isAllExpanded = usePlannerStore((state) => state.isAllExpanded);
  const toggleExpandAll = usePlannerStore((state) => state.toggleExpandAll);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) {
      return;
    }

    // Dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Extract course ID, handling the potential '-index' suffix
    const courseId = source.droppableId === 'sidebar' 
      ? draggableId 
      : draggableId.substring(0, draggableId.lastIndexOf('-'));

    moveCourse(
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index,
      courseId
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <h1>BruinPlan</h1>
        </div>
        <div className="header-actions">
          <button 
            className="header-btn" 
            onClick={toggleExpandAll}
          >
            {isAllExpanded ? "Collapse All Cards" : "Expand All Cards"}
          </button>
        </div>
      </header>
      
      <main className="main-content">
        <DragDropContext onDragEnd={onDragEnd}>
          <CourseSidebar />
          <PlannerGrid />
        </DragDropContext>
      </main>
    </div>
  );
}

export default App;
