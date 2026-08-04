using BlogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Data;

public class BlogDbContext : DbContext
{
    public BlogDbContext(DbContextOptions<BlogDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<PostLike> PostLikes => Set<PostLike>();
    public DbSet<SavedPost> SavedPosts => Set<SavedPost>();
    public DbSet<FriendRequest> FriendRequests => Set<FriendRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => new { u.Provider, u.ProviderId })
            .IsUnique()
            .HasFilter("[Provider] IS NOT NULL AND [ProviderId] IS NOT NULL");

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Post>(entity =>
        {
            entity.Property(p => p.Title).HasMaxLength(220);
            entity.Property(p => p.Excerpt).HasMaxLength(500);
            entity.Property(p => p.CoverImage).HasMaxLength(1000);
            entity.Property(p => p.Category).HasMaxLength(100);
            entity.Property(p => p.ReadTime).HasMaxLength(50);
            entity.Property(p => p.Visibility).HasDefaultValue(BlogVisibility.Public);
        });

        modelBuilder.Entity<PostLike>(entity =>
        {
            entity.HasKey(like => new { like.UserId, like.PostId });

            entity.HasOne(like => like.User)
                .WithMany(user => user.LikedPosts)
                .HasForeignKey(like => like.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(like => like.Post)
                .WithMany(post => post.Likes)
                .HasForeignKey(like => like.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SavedPost>(entity =>
        {
            entity.HasKey(saved => new { saved.UserId, saved.PostId });

            entity.HasOne(saved => saved.User)
                .WithMany(user => user.SavedPosts)
                .HasForeignKey(saved => saved.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(saved => saved.Post)
                .WithMany(post => post.SavedByUsers)
                .HasForeignKey(saved => saved.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FriendRequest>(entity =>
        {
            entity.HasKey(fr => fr.Id);

            entity.Property(fr => fr.CreatedAt)
                .HasDefaultValueSql("NOW()");

            entity.Property(fr => fr.UpdatedAt)
                .HasDefaultValueSql("NOW()");

            entity.HasOne(fr => fr.Sender)
                .WithMany(u => u.SentFriendRequests)
                .HasForeignKey(fr => fr.SenderId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(fr => fr.Receiver)
                .WithMany(u => u.ReceivedFriendRequests)
                .HasForeignKey(fr => fr.ReceiverId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(fr => new { fr.SenderId, fr.ReceiverId }).IsUnique();
            entity.HasIndex(fr => fr.Status);
        });
    }
}
