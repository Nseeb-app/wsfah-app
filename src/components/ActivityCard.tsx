"use client";

import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Activity {
  id: string;
  userId: string;
  type: string;
  entityId: string | null;
  entityType: string | null;
  metadata: string | null;
  createdAt: string;
  user: User;
}

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} د`;
    if (diffHours < 24) return `منذ ${diffHours} س`;
    if (diffDays < 7) return `منذ ${diffDays} ي`;
    return date.toLocaleDateString("ar");
  };

  const renderActivity = () => {
    const userName = activity.user.name || "شخص ما";
    const userAvatar = activity.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=25f459&color=fff&size=64`;

    switch (activity.type) {
      case "RECIPE_CREATE":
        return (
          <div className="flex items-start gap-3">
            <Link
              href={`/recipe/${activity.entityId}`}
              className="flex-shrink-0"
            >
              <img
                src={userAvatar}
                alt={userName}
                className="size-10 rounded-full object-cover border-2 border-primary/20"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">{userName}</span>
                {" "}
                أنشأ وصفة جديدة
              </p>
              <Link
                href={`/recipe/${activity.entityId}`}
                className="text-sm text-primary hover:underline"
              >
                عرض الوصفة
              </Link>
            </div>
          </div>
        );

      case "LIKE":
      case "SAVE":
        return (
          <div className="flex items-start gap-3">
            <Link
              href={`/recipe/${activity.entityId}`}
              className="flex-shrink-0"
            >
              <img
                src={userAvatar}
                alt={userName}
                className="size-10 rounded-full object-cover border-2 border-primary/20"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">{userName}</span>
                {" "}
                {activity.type === "LIKE" ? "أعجب بـ" : "حفظ"}
                {" "}
                وصفة
              </p>
              <Link
                href={`/recipe/${activity.entityId}`}
                className="text-sm text-primary hover:underline"
              >
                عرض الوصفة
              </Link>
            </div>
          </div>
        );

      case "FOLLOW":
        return (
          <div className="flex items-start gap-3">
            <Link
              href={`/profile/${activity.userId}`}
              className="flex-shrink-0"
            >
              <img
                src={userAvatar}
                alt={userName}
                className="size-10 rounded-full object-cover border-2 border-primary/20"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">{userName}</span>
                {" "}
                بدأ متابعة
                {" "}
                <Link
                  href={`/profile/${activity.userId}`}
                  className="text-primary hover:underline"
                >
                  {activity.entityId}
                </Link>
              </p>
            </div>
          </div>
        );

      case "COMMENT_CREATE":
        return (
          <div className="flex items-start gap-3">
            <Link
              href={activity.entityType === "recipe" ? `/recipe/${activity.entityId}` : `/explore/${activity.entityId}`}
              className="flex-shrink-0"
            >
              <img
                src={userAvatar}
                alt={userName}
                className="size-10 rounded-full object-cover border-2 border-primary/20"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">{userName}</span>
                {" "}
                علّق على{" "}
                {activity.entityType === "recipe" ? "وصفة" : "منشور"}
              </p>
              <Link
                href={activity.entityType === "recipe" ? `/recipe/${activity.entityId}` : `/explore/${activity.entityId}`}
                className="text-sm text-primary hover:underline"
              >
                عرض {activity.entityType === "recipe" ? "الوصفة" : "المنشور"}
              </Link>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-start gap-3">
            <img
              src={userAvatar}
              alt={userName}
              className="size-10 rounded-full object-cover border-2 border-primary/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">{userName}</span>
                {" "}
                {activity.type.toLowerCase().replace(/_/g, " ")}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      {renderActivity()}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {formatDate(activity.createdAt)}
      </p>
    </div>
  );
}
