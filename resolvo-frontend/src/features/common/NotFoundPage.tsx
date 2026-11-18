import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'EMPLOYEE':
        return '/employee';
      case 'TECHNICIAN':
        return '/technician';
      case 'ADMIN':
        return '/admin';
      default:
        return '/';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'Home';
    switch (user.role) {
      case 'EMPLOYEE':
        return 'Employee Dashboard';
      case 'TECHNICIAN':
        return 'Technician Console';
      case 'ADMIN':
        return 'Operations Center';
      default:
        return 'Home';
    }
  };

  return (
    <div className="min-h-screen bg-royal-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial atmosphere glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-royal-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center border border-royal-100">
        {/* Glowing Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-royal-900 flex items-center justify-center text-pink shadow-lg shadow-royal-900/20 ring-4 ring-pink/20 mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-royal-50 text-royal-700 font-mono text-xs font-semibold uppercase tracking-wider mb-3">
          Error 404 | Resource Not Found
        </div>

        <h1 className="text-3xl font-extrabold text-royal-900 tracking-tight">
          Lost in the Service Mesh
        </h1>

        <p className="text-sm text-royal-600 mt-3 leading-relaxed">
          The requested ITIL path <code className="bg-royal-50 px-2 py-0.5 rounded font-mono text-xs text-pink-deep border border-royal-200">{location.pathname}</code> does not correspond to an active portal route or catalog resource.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>

          {isAuthenticated ? (
            <Link to={getDashboardPath()}>
              <Button
                variant="primary"
                size="md"
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
              >
                {getDashboardLabel()}
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Home className="w-4 h-4" />}
              >
                Return to Landing
              </Button>
            </Link>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-royal-100 text-xs text-royal-400">
          Resolvo Intelligent ITIL Resolution Platform | CS F213 / MAC F212
        </div>
      </div>
    </div>
  );
};
