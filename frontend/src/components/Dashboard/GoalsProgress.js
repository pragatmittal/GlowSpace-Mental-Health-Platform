import React, { useState, useEffect } from 'react';
import './GoalsProgress.css';

const GoalsProgress = ({ userId }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/users/${userId}/goals`);
      // const data = await response.json();
      
      // Mock data for development
      const mockGoals = [
        {
          id: 1,
          title: 'Daily Meditation',
          description: 'Meditate for 10 minutes daily',
          category: 'mindfulness',
          targetValue: 30,
          currentValue: 23,
          unit: 'days',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          status: 'active',
          priority: 'high',
          streak: 5
        },
        {
          id: 2,
          title: 'Exercise Routine',
          description: 'Complete 20 workout sessions',
          category: 'physical',
          targetValue: 20,
          currentValue: 14,
          unit: 'sessions',
          startDate: '2024-01-01',
          endDate: '2024-02-15',
          status: 'active',
          priority: 'medium',
          streak: 3
        },
        {
          id: 3,
          title: 'Journal Writing',
          description: 'Write in journal 3 times per week',
          category: 'emotional',
          targetValue: 12,
          currentValue: 8,
          unit: 'entries',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          status: 'active',
          priority: 'medium',
          streak: 2
        },
        {
          id: 4,
          title: 'Social Connection',
          description: 'Meet with friends weekly',
          category: 'social',
          targetValue: 4,
          currentValue: 4,
          unit: 'meetings',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          status: 'completed',
          priority: 'high',
          streak: 4
        }
      ];

      setGoals(mockGoals);
      setError(null);
    } catch (err) {
      setError('Failed to load goals');
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateGoalProgress = async (goalId, increment = 1) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/goals/${goalId}/progress`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ increment })
      // });

      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { 
              ...goal, 
              currentValue: Math.min(goal.currentValue + increment, goal.targetValue),
              streak: goal.currentValue + increment > goal.currentValue ? goal.streak + 1 : goal.streak
            }
          : goal
      ));
    } catch (err) {
      console.error('Error updating goal progress:', err);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      mindfulness: '🧘',
      physical: '💪',
      emotional: '❤️',
      social: '👥',
      productivity: '📈',
      learning: '📚'
    };
    return icons[category] || '🎯';
  };

  const getCategoryColor = (category) => {
    const colors = {
      mindfulness: '#6366f1',
      physical: '#10b981',
      emotional: '#f59e0b',
      social: '#ec4899',
      productivity: '#8b5cf6',
      learning: '#06b6d4'
    };
    return colors[category] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getTimeRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  const displayGoals = showCompleted ? completedGoals : activeGoals;

  if (loading) {
    return (
      <div className="goals-progress">
        <div className="goals-header">
          <h3>Goals Progress</h3>
          <div className="goals-toggle">
            <div className="toggle-skeleton"></div>
          </div>
        </div>
        <div className="goals-list">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="goal-item skeleton">
              <div className="goal-header">
                <div className="goal-icon skeleton-circle"></div>
                <div className="goal-info">
                  <div className="goal-title skeleton-text"></div>
                  <div className="goal-description skeleton-text"></div>
                </div>
                <div className="goal-priority skeleton-badge"></div>
              </div>
              <div className="goal-progress">
                <div className="progress-bar skeleton-bar"></div>
                <div className="progress-text skeleton-text"></div>
              </div>
              <div className="goal-footer">
                <div className="goal-time skeleton-text"></div>
                <div className="goal-actions">
                  <div className="action-btn skeleton-btn"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="goals-progress">
        <div className="goals-header">
          <h3>Goals Progress</h3>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={fetchGoals} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="goals-progress">
      <div className="goals-header">
        <h3>Goals Progress</h3>
        <div className="goals-toggle">
          <button 
            className={!showCompleted ? 'active' : ''}
            onClick={() => setShowCompleted(false)}
          >
            Active ({activeGoals.length})
          </button>
          <button 
            className={showCompleted ? 'active' : ''}
            onClick={() => setShowCompleted(true)}
          >
            Completed ({completedGoals.length})
          </button>
        </div>
      </div>

      {displayGoals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h4>No {showCompleted ? 'completed' : 'active'} goals</h4>
          <p>
            {showCompleted 
              ? 'Complete some goals to see them here'
              : 'Set some goals to start tracking your progress'
            }
          </p>
          {!showCompleted && (
            <button className="create-goal-btn">
              Create New Goal
            </button>
          )}
        </div>
      ) : (
        <div className="goals-list">
          {displayGoals.map(goal => (
            <div key={goal.id} className="goal-item">
              <div className="goal-header">
                <div 
                  className="goal-icon"
                  style={{ backgroundColor: getCategoryColor(goal.category) }}
                >
                  {getCategoryIcon(goal.category)}
                </div>
                <div className="goal-info">
                  <h4 className="goal-title">{goal.title}</h4>
                  <p className="goal-description">{goal.description}</p>
                </div>
                <div 
                  className="goal-priority"
                  style={{ backgroundColor: getPriorityColor(goal.priority) }}
                >
                  {goal.priority}
                </div>
              </div>

              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getProgressPercentage(goal.currentValue, goal.targetValue)}%`,
                      backgroundColor: getCategoryColor(goal.category)
                    }}
                  ></div>
                </div>
                <div className="progress-text">
                  <span className="progress-numbers">
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </span>
                  <span className="progress-percentage">
                    {Math.round(getProgressPercentage(goal.currentValue, goal.targetValue))}%
                  </span>
                </div>
              </div>

              <div className="goal-footer">
                <div className="goal-meta">
                  <span className="goal-time">
                    🕐 {getTimeRemaining(goal.endDate)}
                  </span>
                  {goal.streak > 0 && (
                    <span className="goal-streak">
                      🔥 {goal.streak} streak
                    </span>
                  )}
                </div>
                
                {goal.status === 'active' && (
                  <div className="goal-actions">
                    <button 
                      className="action-btn update-btn"
                      onClick={() => updateGoalProgress(goal.id)}
                      disabled={goal.currentValue >= goal.targetValue}
                    >
                      +1
                    </button>
                    <button className="action-btn edit-btn">
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalsProgress;
