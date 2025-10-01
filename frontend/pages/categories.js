import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Categories() {
  const [posts, setPosts] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});

  useEffect(() => {
    const localPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const allPosts = localPosts.length > 0 ? localPosts : [
      {
        id: 1,
        title: "Welcome to Campus Creatives! 🎉",
        content: "This is your creative space to share artwork, writing, photography, and more with fellow students.",
        author_name: "Admin",
        post_type: "writing",
        likes_count: 12,
        comments_count: 4,
        created_at: new Date().toISOString(),
        tags: ["welcome", "introduction"]
      },
      {
        id: 2,
        title: "Sunset Photography Collection 🌅",
        content: "Captured these beautiful sunsets around campus.",
        author_name: "PhotoStudent",
        post_type: "photo", 
        likes_count: 28,
        comments_count: 7,
        created_at: new Date().toISOString(),
        tags: ["photography", "sunset", "nature"]
      },
      {
        id: 3,
        title: "Digital Art Portfolio 🎨",
        content: "My latest digital art series inspired by campus architecture.",
        author_name: "ArtStudent",
        post_type: "art",
        likes_count: 35,
        comments_count: 9,
        created_at: new Date().toISOString(),
        tags: ["digital art", "procreate", "nature"]
      }
    ];
    
    setPosts(allPosts);
    calculateCategoryStats(allPosts);
  }, []);

  const calculateCategoryStats = (postsData) => {
    const stats = {
      art: { count: 0, likes: 0, comments: 0, posts: [] },
      writing: { count: 0, likes: 0, comments: 0, posts: [] },
      photo: { count: 0, likes: 0, comments: 0, posts: [] },
      other: { count: 0, likes: 0, comments: 0, posts: [] }
    };

    postsData.forEach(post => {
      if (stats[post.post_type]) {
        stats[post.post_type].count++;
        stats[post.post_type].likes += post.likes_count;
        stats[post.post_type].comments += post.comments_count;
        stats[post.post_type].posts.push(post);
      }
    });

    setCategoryStats(stats);
  };

  const getCategoryColor = (type) => {
    const colors = {
      art: 'from-pink-500 to-red-500',
      writing: 'from-green-500 to-teal-500',
      photo: 'from-blue-500 to-cyan-500',
      other: 'from-purple-500 to-indigo-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getCategoryIcon = (type) => {
    const icons = {
      art: '🎨',
      writing: '📝',
      photo: '📸',
      other: '💫'
    };
    return icons[type] || '📄';
  };

  const getCategoryDescription = (type) => {
    const descriptions = {
      art: 'Visual creations including paintings, drawings, digital art, sculptures, and mixed media artworks.',
      writing: 'Written works like poetry, stories, essays, scripts, and creative writing pieces.',
      photo: 'Photography ranging from portraits and landscapes to abstract and documentary styles.',
      other: 'Unique creative expressions including music, dance, crafts, and innovative projects.'
    };
    return descriptions[type] || 'Creative expressions and artworks.';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">🏷️</span>
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-4">Explore Categories</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover creative works organized by category. Find inspiration in specific art forms or share your own talent.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 mb-12">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <Link key={category} href={`/categories/${category}`}>
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${getCategoryColor(category)}`}></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{getCategoryIcon(category)}</span>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 capitalize">{category}</h3>
                          <p className="text-gray-600">{stats.count} posts</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{getCategoryDescription(category)}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-600">{stats.likes}</div>
                        <div className="text-sm text-gray-600">Total Likes</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-blue-600">{stats.comments}</div>
                        <div className="text-sm text-gray-600">Total Comments</div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {stats.posts.slice(0, 3).map(post => post.author_name).join(', ')}
                        {stats.posts.length > 3 && ` +${stats.posts.length - 3} more`}
                      </span>
                      <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Explore →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* All Tags Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold gradient-text mb-6 text-center">Popular Tags</h2>
            
            {/* Get all unique tags */}
            {(() => {
              const allTags = [...new Set(posts.flatMap(post => post.tags || []))];
              const tagCounts = {};
              
              posts.forEach(post => {
                (post.tags || []).forEach(tag => {
                  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
              });

              const popularTags = Object.entries(tagCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 20);

              return (
                <div className="flex flex-wrap gap-3 justify-center">
                  {popularTags.map(([tag, count]) => (
                    <Link key={tag} href={`/tags/${tag}`}>
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 px-4 py-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-105 border border-gray-300">
                        <span className="font-medium text-gray-700">#{tag}</span>
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {count}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()}

            <div className="text-center mt-6">
              <Link href="/tags" className="text-blue-600 hover:text-blue-700 font-semibold">
                View All Tags →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
