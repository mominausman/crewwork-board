import { Badge } from "./ui/badge";
import { Crown, Shield, User } from "lucide-react";

interface RoleBadgeProps {
  role: string;
  showIcon?: boolean;
}

export default function RoleBadge({ role, showIcon = true }: RoleBadgeProps) {
  const roleConfig = {
    admin: {
      label: "Admin",
      variant: "admin" as const,
      icon: Crown,
    },
    manager: {
      label: "Manager",
      variant: "manager" as const,
      icon: Shield,
    },
    member: {
      label: "Team Member",
      variant: "member" as const,
      icon: User,
    },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="text-xs">
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
