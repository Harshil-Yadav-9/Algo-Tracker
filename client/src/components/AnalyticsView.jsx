import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Radar, Doughnut, Bar } from 'react-chartjs-2';
import { 
  BarChart3, 
  PieChart, 
  Target, 
  Zap, 
  TrendingUp, 
  Cpu,
  ArrowRight,
  Terminal
} from 'lucide-react';

// Register ChartJS plugins
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function AnalyticsView({ syncData, onSelectConcept }) {
  const summary = syncData?.summary || { totalSolved: 0, easy: 0, medium: 0, hard: 0 };
  const platformBreakdown = syncData?.platformBreakdown || [];
  const concepts = syncData?.concepts || [];

  // Top 8 core skills for Radar
  const coreSkillNames = [
    'Dynamic Programming',
    'Graphs & Trees',
    'Binary Search',
    'Greedy',
    'Math & Number Theory',
    'Data Structures',
    'Strings & Hashing',
    'Bit Manipulation'
  ];

  const skillDataValues = coreSkillNames.map(skill => {
    const found = concepts.find(c => c.name.toLowerCase().includes(skill.toLowerCase().split('&')[0].trim()));
    return found ? found.count : 0;
  });

  const radarData = {
    labels: coreSkillNames,
    datasets: [
      {
        label: 'Solved',
        data: skillDataValues,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: '#22c55e',
        borderWidth: 2,
        pointBackgroundColor: '#4ade80',
        pointBorderColor: '#060906',
        pointHoverBackgroundColor: '#86efac',
        pointHoverBorderColor: '#22c55e'
      }
    ]
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(34, 197, 94, 0.15)' },
        grid: { color: 'rgba(34, 197, 94, 0.1)' },
        pointLabels: { color: '#86efac', font: { size: 10, family: "'JetBrains Mono', monospace" } },
        ticks: { backdropColor: 'transparent', color: '#4ade80', font: { size: 9, family: "'JetBrains Mono', monospace" } }
      }
    },
    plugins: {
      legend: { display: false }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  // Difficulty Doughnut
  const doughnutData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [summary.easy || 1, summary.medium || 1, summary.hard || 1],
        backgroundColor: ['#22c55e', '#15803d', '#84cc16'],
        borderColor: '#060906',
        borderWidth: 2
      }
    ]
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#86efac', font: { family: "'JetBrains Mono', monospace", size: 11 } }
      }
    },
    cutout: '72%',
    responsive: true,
    maintainAspectRatio: false
  };

  // Platform Bar Chart
  const barData = {
    labels: platformBreakdown.map(p => p.name),
    datasets: [
      {
        label: 'Solved',
        data: platformBreakdown.map(p => p.solved),
        backgroundColor: '#22c55e',
        borderRadius: 2
      }
    ]
  };

  const barOptions = {
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#86efac', font: { family: "'JetBrains Mono', monospace", size: 10 } }
      },
      y: {
        grid: { color: 'rgba(34, 197, 94, 0.08)' },
        ticks: { color: '#86efac', font: { family: "'JetBrains Mono', monospace", size: 10 } }
      }
    },
    plugins: {
      legend: { display: false }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  // Weak concept identifier: lowest 3 skills among core skills
  const skillsWithCounts = coreSkillNames.map((skill, idx) => ({
    name: skill,
    count: skillDataValues[idx]
  })).sort((a, b) => a.count - b.count);

  const weakSkills = skillsWithCounts.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.04em' }}>
            $ /usr/bin/analytics --radar --topics
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Real-time multi-platform algorithmic competence breakdown and topic coverage analytics.
          </p>
        </div>
      </div>

      {/* 1. Radar & Difficulty Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* Skillset Radar Chart */}
        <div className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Target size={16} color="var(--accent-green)" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
              [ALGO_SKILL_RADAR]
            </h3>
          </div>
          <div style={{ position: 'relative', height: '240px', flexGrow: 1 }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Difficulty Distribution Doughnut */}
        <div className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <PieChart size={16} color="var(--accent-green)" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
              [DIFFICULTY_RATIO]
            </h3>
          </div>
          <div style={{ position: 'relative', height: '200px', flexGrow: 1 }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', marginTop: '0.35rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.45rem' }}>
            <span style={{ color: '#22c55e' }}>EASY: {summary.easy}</span>
            <span style={{ color: '#15803d' }}>MED: {summary.medium}</span>
            <span style={{ color: '#84cc16' }}>HARD: {summary.hard}</span>
          </div>
        </div>
      </div>

      {/* 2. Platform Comparison Bar Chart & Weak Concept Recommendations */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* Platform Share Bar Chart */}
        <div className="glass-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <BarChart3 size={16} color="var(--accent-green)" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
              [PLATFORM_DISTRIBUTION]
            </h3>
          </div>
          <div style={{ position: 'relative', height: '220px' }}>
            {platformBreakdown.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', paddingTop: '3rem', fontSize: '0.75rem' }}>
                // No linked handles detected. Connect handles to render volume charts.
              </p>
            )}
          </div>
        </div>

        {/* Smart Improvement & Weak Area Recommendations */}
        <div className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Cpu size={16} color="var(--accent-green)" />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                [TARGET_FOCUS_AREAS]
              </h3>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              Weakest coverage identified. Practice these topics to optimize competitive performance:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {weakSkills.map((skill) => (
                <div 
                  key={skill.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    background: 'var(--bg-dark)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-main)' }}>
                      {skill.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      Solved: {skill.count} problems
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-terminal btn-sm"
                    onClick={() => onSelectConcept(skill.name)}
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                  >
                    <span>PRACTICE</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
