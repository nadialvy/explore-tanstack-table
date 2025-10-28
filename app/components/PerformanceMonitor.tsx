import { useEffect, useState, useRef } from "react";

interface PerformanceMetrics {
  renderTime: number;
  updateCount: number;
  minUpdateTime: number;
  maxUpdateTime: number;
  averageUpdateTime: number;
  p95UpdateTime: number;
  memoryUsage?: number;
}

export function PerformanceMonitor({
  editorName,
  updateCount,
  onMeasureUpdate,
}: {
  editorName: string;
  updateCount: number;
  onMeasureUpdate?: (duration: number) => void;
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    updateCount: 0,
    minUpdateTime: Infinity,
    maxUpdateTime: 0,
    averageUpdateTime: 0,
    p95UpdateTime: 0,
  });
  const [startTime] = useState(performance.now());
  const updateTimes = useRef<number[]>([]);

  useEffect(() => {
    const renderTime = performance.now() - startTime;
    setMetrics((prev) => ({ ...prev, renderTime }));
  }, [startTime]);

  useEffect(() => {
    if (onMeasureUpdate && updateCount > 0) {
    }
  }, [updateCount, onMeasureUpdate]);

  const recordUpdate = (duration: number) => {
    updateTimes.current.push(duration);

    const sortedTimes = [...updateTimes.current].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);

    setMetrics((prev) => ({
      ...prev,
      updateCount: updateTimes.current.length,
      minUpdateTime: Math.min(...updateTimes.current),
      maxUpdateTime: Math.max(...updateTimes.current),
      averageUpdateTime:
        updateTimes.current.reduce((a, b) => a + b, 0) /
        updateTimes.current.length,
      p95UpdateTime: sortedTimes[p95Index] || 0,
    }));
  };

  // expose recordUpdate to parent
  useEffect(() => {
    if (onMeasureUpdate) {
      (window as any)[`recordUpdate_${editorName}`] = recordUpdate;
    }
  }, [editorName, onMeasureUpdate]);

  useEffect(() => {
    // check memory usage if available
    if ((performance as any).memory) {
      const interval = setInterval(() => {
        const memory = (performance as any).memory;
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1048576, // Convert to MB
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-4 text-sm space-y-2 w-full max-w-3xl">
      <h3 className="font-bold text-lg mb-3">{editorName} Performance</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <span className="text-gray-600">Initial Render:</span>
          <span className="ml-2 font-mono font-bold text-blue-600">
            {metrics.renderTime.toFixed(2)}ms
          </span>
        </div>
        <div>
          <span className="text-gray-600">Updates:</span>
          <span className="ml-2 font-mono font-bold text-green-600">
            {metrics.updateCount}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Min:</span>
          <span className="ml-2 font-mono font-bold text-cyan-600">
            {metrics.minUpdateTime === Infinity
              ? "0.00"
              : metrics.minUpdateTime.toFixed(2)}
            ms
          </span>
        </div>
        <div>
          <span className="text-gray-600">Max:</span>
          <span className="ml-2 font-mono font-bold text-red-600">
            {metrics.maxUpdateTime.toFixed(2)}ms
          </span>
        </div>
        <div>
          <span className="text-gray-600">Average:</span>
          <span className="ml-2 font-mono font-bold text-orange-600">
            {metrics.averageUpdateTime.toFixed(2)}ms
          </span>
        </div>
        <div>
          <span className="text-gray-600">P95:</span>
          <span className="ml-2 font-mono font-bold text-purple-600">
            {metrics.p95UpdateTime.toFixed(2)}ms
          </span>
        </div>
        {metrics.memoryUsage && (
          <div className="col-span-3">
            <span className="text-gray-600">Memory:</span>
            <span className="ml-2 font-mono font-bold text-pink-600">
              {metrics.memoryUsage.toFixed(2)}MB
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
