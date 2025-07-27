import React from 'react';
import './MoodStreaks.css';

const MoodStreaks = ({ streaks }) => {
  if (!streaks) {
    return (
      <div className="mood-streaks">
        <div className="streaks-loading">
          <p>Loading streaks...</p>
        </div>
      </div>
    );
  }

  const streakData = [
    {
      type: 'tracking',
      current: streaks.currentTrackingStreak || 0,
      max: streaks.maxTrackingStreak || 0,
      icon: '🔥',
      label: 'Tracking Streak',
      description: 'Consecutive days of mood tracking',
      color: '#667eea'
    },
    {
      type: 'positive',
      current: streaks.currentPositiveStreak || 0,
      max: streaks.maxPositiveStreak || 0,
      icon: '📈',
      label: 'Positive Streak',
      description: 'Consecutive days of positive mood',
      color: '#2ecc71'
    }
  ];

  const getStreakLevel = (current) => {
    if (current >= 30) return { level: 'Master', badge: '🏆', color: '#f39c12' };
    if (current >= 21) return { level: 'Expert', badge: '⭐', color: '#9b59b6' };
    if (current >= 14) return { level: 'Advanced', badge: '🌟', color: '#3498db' };
    if (current >= 7) return { level: 'Intermediate', badge: '✨', color: '#2ecc71' };
    if (current >= 3) return { level: 'Beginner', badge: '🌱', color: '#95a5a6' };
    return { level: 'New', badge: '🌱', color: '#bdc3c7' };
  };

  return (
    <div className="mood-streaks">
      <div className="streaks-grid">
        {streakData.map((streak) => {
          const level = getStreakLevel(streak.current);
          const progress = streak.max > 0 ? (streak.current / streak.max) * 100 : 0;
          
          return (
            <div key={streak.type} className="streak-card">
              <div className="streak-header">
                <div className="streak-icon" style={{ backgroundColor: streak.color }}>
                  {streak.icon}
                </div>
                <div className="streak-info">
                  <h4>{streak.label}</h4>
                  <p>{streak.description}</p>
                </div>
              </div>
              
              <div className="streak-stats">
                <div className="current-streak">
                  <span className="streak-number">{streak.current}</span>
                  <span className="streak-label">Current</span>
                </div>
                
                <div className="max-streak">
                  <span className="streak-number">{streak.max}</span>
                  <span className="streak-label">Best</span>
                </div>
              </div>
              
              <div className="streak-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: streak.color
                    }}
                  ></div>
                </div>
                <span className="progress-text">{Math.round(progress)}% of best</span>
              </div>
              
              <div className="streak-level">
                <span className="level-badge" style={{ color: level.color }}>
                  {level.badge}
                </span>
                <span className="level-text">{level.level}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Achievements Section */}
      <div className="achievements-section">
        <h4>Achievements</h4>
        <div className="achievements-grid">
          {streakData.map((streak) => {
            const achievements = [];
            
            // Tracking achievements
            if (streak.type === 'tracking') {
              if (streak.current >= 7) achievements.push({ icon: '📅', text: 'Week Warrior', unlocked: true });
              if (streak.current >= 30) achievements.push({ icon: '📆', text: 'Monthly Master', unlocked: true });
              if (streak.current >= 100) achievements.push({ icon: '🎯', text: 'Century Club', unlocked: true });
              if (streak.max >= 365) achievements.push({ icon: '👑', text: 'Year Champion', unlocked: true });
            }
            
            // Positive mood achievements
            if (streak.type === 'positive') {
              if (streak.current >= 3) achievements.push({ icon: '😊', text: 'Happy Trio', unlocked: true });
              if (streak.current >= 7) achievements.push({ icon: '🌈', text: 'Week of Joy', unlocked: true });
              if (streak.current >= 21) achievements.push({ icon: '🌟', text: 'Joy Master', unlocked: true });
              if (streak.max >= 100) achievements.push({ icon: '💎', text: 'Diamond Spirit', unlocked: true });
            }
            
            return achievements.map((achievement, index) => (
              <div key={`${streak.type}-${index}`} className={`achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                <span className="achievement-icon">{achievement.icon}</span>
                <span className="achievement-text">{achievement.text}</span>
              </div>
            ));
          })}
        </div>
      </div>
      
      {/* Motivation Section */}
      <div className="motivation-section">
        <div className="motivation-card">
          <div className="motivation-icon">💪</div>
          <div className="motivation-content">
            <h5>Keep Going!</h5>
            <p>
              {streaks.currentTrackingStreak > 0 
                ? `You've been tracking your mood for ${streaks.currentTrackingStreak} day${streaks.currentTrackingStreak > 1 ? 's' : ''}!`
                : 'Start your mood tracking journey today!'
              }
            </p>
            {streaks.currentPositiveStreak > 0 && (
              <p className="positive-note">
                🎉 You've had {streaks.currentPositiveStreak} consecutive positive day{streaks.currentPositiveStreak > 1 ? 's' : ''}!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodStreaks; 